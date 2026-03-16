package main

import (
	"context"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"tigris-storage-bench/gobench"
)

func runBenchmark(ctx context.Context, args []string) error {
	gobench.LoadDotEnv(".env")

	options, err := gobench.ParseBenchmarkArgs(args)
	if err != nil {
		return err
	}

	auth, err := gobench.LoadAuthConfig(options.Endpoint)
	if err != nil {
		return err
	}
	clients, err := gobench.NewClients(ctx, auth)
	if err != nil {
		return err
	}

	suiteRunID := gobench.MakeRunID(options.Prefix)
	suiteArtifactDir := filepath.Join(options.ArtifactsRoot, suiteRunID)
	if err := gobench.EnsureDir(suiteArtifactDir); err != nil {
		return err
	}

	aggregate := gobench.BenchmarkResults{
		RunID:     suiteRunID,
		CreatedAt: gobench.NowRFC3339(),
		Results:   []gobench.OperationResult{},
	}
	operationRuns := []gobench.OperationRun{}
	var scenarioTemplate *gobench.BenchmarkManifest

	for _, operation := range options.Operations {
		isolated := options
		isolated.Prefix = fmt.Sprintf("%s-%s", options.Prefix, operation)
		isolated.Operations = []gobench.OperationName{operation}
		isolated.ArtifactsRoot = suiteArtifactDir

		manifest, err := gobench.ProvisionRun(ctx, clients, isolated)
		if err != nil {
			return err
		}
		if scenarioTemplate == nil {
			manifestCopy := manifest
			scenarioTemplate = &manifestCopy
		}

		fmt.Printf("Provisioned isolated run %s for %s\n", manifest.RunID, operation)

		results, benchErr := gobench.RunBenchmarks(ctx, clients, manifest)
		if benchErr != nil {
			if !options.KeepBuckets {
				_ = gobench.CleanupRun(ctx, clients, manifest)
			}
			return benchErr
		}

		if err := gobench.WriteJSON(filepath.Join(manifest.ArtifactDir, "results.json"), results); err != nil {
			return err
		}
		if err := gobench.WriteText(filepath.Join(manifest.ArtifactDir, "summary.md"), gobench.RenderSummary(manifest, results, nil, "go")); err != nil {
			return err
		}

		aggregate.Results = append(aggregate.Results, results.Results...)
		operationRuns = append(operationRuns, gobench.OperationRun{
			Operation:    operation,
			RunID:        manifest.RunID,
			ArtifactDir:  manifest.ArtifactDir,
			ManifestPath: filepath.Join(manifest.ArtifactDir, "manifest.json"),
			ResultsPath:  filepath.Join(manifest.ArtifactDir, "results.json"),
			SummaryPath:  filepath.Join(manifest.ArtifactDir, "summary.md"),
		})

		if !options.KeepBuckets {
			if err := gobench.CleanupRun(ctx, clients, manifest); err != nil {
				return err
			}
			fmt.Printf("Buckets cleaned up for %s.\n", operation)
		} else {
			fmt.Printf("Buckets retained for %s because --keep-buckets was set.\n", operation)
		}
	}

	if scenarioTemplate == nil {
		return errors.New("no operations were selected")
	}

	suiteManifest := *scenarioTemplate
	suiteManifest.RunID = suiteRunID
	suiteManifest.CreatedAt = gobench.NowRFC3339()
	suiteManifest.Options = options
	suiteManifest.ArtifactDir = suiteArtifactDir

	if err := gobench.WriteJSON(filepath.Join(suiteArtifactDir, "suite.json"), map[string]any{
		"runId":         suiteRunID,
		"createdAt":     suiteManifest.CreatedAt,
		"options":       options,
		"operationRuns": operationRuns,
	}); err != nil {
		return err
	}
	if err := gobench.WriteJSON(filepath.Join(suiteArtifactDir, "results.json"), aggregate); err != nil {
		return err
	}
	if err := gobench.WriteText(filepath.Join(suiteArtifactDir, "summary.md"), gobench.RenderSummary(suiteManifest, aggregate, operationRuns, "go")); err != nil {
		return err
	}

	fmt.Printf("Summary: %s\n", filepath.Join(suiteArtifactDir, "summary.md"))
	fmt.Printf("Results: %s\n", filepath.Join(suiteArtifactDir, "results.json"))
	return nil
}

func runCleanup(ctx context.Context, args []string) error {
	gobench.LoadDotEnv(".env")

	suitePath, err := gobench.ParseCleanupArgs(args)
	if err != nil {
		return err
	}

	content, err := os.ReadFile(suitePath)
	if err != nil {
		return err
	}

	var suite struct {
		OperationRuns []struct {
			ManifestPath string `json:"manifestPath"`
		} `json:"operationRuns"`
	}
	if err := json.Unmarshal(content, &suite); err != nil {
		return err
	}

	auth, err := gobench.LoadAuthConfig("")
	if err != nil {
		return err
	}
	clients, err := gobench.NewClients(ctx, auth)
	if err != nil {
		return err
	}

	for _, run := range suite.OperationRuns {
		manifestContent, err := os.ReadFile(run.ManifestPath)
		if err != nil {
			return err
		}
		var manifest gobench.BenchmarkManifest
		if err := json.Unmarshal(manifestContent, &manifest); err != nil {
			return err
		}
		if err := gobench.CleanupRun(ctx, clients, manifest); err != nil {
			return err
		}
	}

	fmt.Printf("Cleaned up buckets from %s\n", suitePath)
	return nil
}

func main() {
	ctx := context.Background()
	if len(os.Args) < 2 || os.Args[1] == "help" || os.Args[1] == "--help" {
		gobench.PrintHelp()
		return
	}

	var err error
	switch os.Args[1] {
	case "benchmark":
		err = runBenchmark(ctx, os.Args[2:])
	case "cleanup":
		err = runCleanup(ctx, os.Args[2:])
	default:
		gobench.PrintHelp()
		return
	}

	if err != nil {
		if errors.Is(err, flag.ErrHelp) {
			return
		}
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}

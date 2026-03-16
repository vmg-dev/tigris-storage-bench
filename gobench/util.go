package gobench

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"
)

var nonBucketChars = regexp.MustCompile(`[^a-z0-9-]+`)
var repeatedDashes = regexp.MustCompile(`-+`)

func NowRFC3339() string {
	return time.Now().UTC().Format(time.RFC3339Nano)
}

func SanitizeBucketPart(value string) string {
	value = strings.ToLower(value)
	value = nonBucketChars.ReplaceAllString(value, "-")
	value = repeatedDashes.ReplaceAllString(value, "-")
	value = strings.Trim(value, "-")
	return value
}

func randomSuffix() string {
	buf := make([]byte, 4)
	if _, err := rand.Read(buf); err != nil {
		panic(err)
	}
	return hex.EncodeToString(buf)
}

func MakeBucketName(prefix, suffix string) string {
	raw := fmt.Sprintf("%s-%s-%s", SanitizeBucketPart(prefix), SanitizeBucketPart(suffix), randomSuffix())
	if len(raw) > 63 {
		raw = raw[:63]
	}
	raw = strings.TrimRight(raw, "-")
	if raw == "" {
		return "tigris-bench"
	}
	return raw
}

func MakeRunID(prefix string) string {
	return fmt.Sprintf("%s-%s-%s", SanitizeBucketPart(prefix), time.Now().UTC().Format("2006-01-02T15-04-05.000Z"), randomSuffix())
}

func CreatePayload(sizeBytes int, seed string) []byte {
	chunk := []byte(seed + "|")
	payload := make([]byte, sizeBytes)
	for offset := 0; offset < sizeBytes; offset += len(chunk) {
		copy(payload[offset:], chunk[:min(len(chunk), sizeBytes-offset)])
	}
	return payload
}

func Percentile(sortedValues []float64, ratio float64) float64 {
	if len(sortedValues) == 0 {
		return 0
	}
	index := int(float64(len(sortedValues))*ratio+0.999999999) - 1
	if index < 0 {
		index = 0
	}
	if index >= len(sortedValues) {
		index = len(sortedValues) - 1
	}
	return sortedValues[index]
}

func SortedCopy(values []float64) []float64 {
	copied := append([]float64(nil), values...)
	sort.Float64s(copied)
	return copied
}

func EnsureDir(path string) error {
	return os.MkdirAll(path, 0o755)
}

func WriteJSON(path string, value any) error {
	data, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, append(data, '\n'), 0o644)
}

func WriteText(path, value string) error {
	return os.WriteFile(path, []byte(value), 0o644)
}

func ResolveArtifactDir(root, runID string) string {
	return filepath.Join(root, runID)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

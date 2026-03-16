package gobench

type OperationName string

const (
	HeadShared         OperationName = "head-shared"
	GetShared          OperationName = "get-shared"
	GetLocal           OperationName = "get-local"
	ListPrefix         OperationName = "list-prefix"
	PutNew             OperationName = "put-new"
	PutOverwriteSeeded OperationName = "put-overwrite-seeded"
	RemoveSeeded       OperationName = "remove-seeded"
)

var OperationNames = []OperationName{
	HeadShared,
	GetShared,
	GetLocal,
	ListPrefix,
	PutNew,
	PutOverwriteSeeded,
	RemoveSeeded,
}

type BenchmarkOptions struct {
	Prefix          string          `json:"prefix"`
	MaxForkDepth    int             `json:"maxForkDepth"`
	ObjectSizeBytes int             `json:"objectSizeBytes"`
	Iterations      int             `json:"iterations"`
	Warmup          int             `json:"warmup"`
	Concurrency     int             `json:"concurrency"`
	SharedReadCount int             `json:"sharedReadCount"`
	LocalReadCount  int             `json:"localReadCount"`
	OverwriteCount  int             `json:"overwriteCount"`
	DeleteCount     int             `json:"deleteCount"`
	ListObjectCount int             `json:"listObjectCount"`
	KeepBuckets     bool            `json:"keepBuckets"`
	ArtifactsRoot   string          `json:"artifactsRoot"`
	Endpoint        string          `json:"endpoint,omitempty"`
	Operations      []OperationName `json:"operations"`
}

type AuthConfig struct {
	AccessKeyID     string
	SecretAccessKey string
	Endpoint        string
}

type BucketScenario struct {
	ID                    string `json:"id"`
	Label                 string `json:"label"`
	Kind                  string `json:"kind"`
	Bucket                string `json:"bucket"`
	SnapshotEnabled       bool   `json:"snapshotEnabled"`
	ForkDepth             int    `json:"forkDepth"`
	ParentScenarioID      string `json:"parentScenarioId,omitempty"`
	ParentBucket          string `json:"parentBucket,omitempty"`
	ParentSnapshotVersion string `json:"parentSnapshotVersion,omitempty"`
}

type FixtureManifest struct {
	SharedReadKeys  stringSlice `json:"sharedReadKeys"`
	LocalReadKeys   stringSlice `json:"localReadKeys"`
	OverwriteKeys   stringSlice `json:"overwriteKeys"`
	DeleteKeys      stringSlice `json:"deleteKeys"`
	ListPrefix      string      `json:"listPrefix"`
	ListObjectCount int         `json:"listObjectCount"`
}

type stringSlice []string

type BenchmarkManifest struct {
	RunID       string           `json:"runId"`
	CreatedAt   string           `json:"createdAt"`
	Options     BenchmarkOptions `json:"options"`
	Fixtures    FixtureManifest  `json:"fixtures"`
	Scenarios   []BucketScenario `json:"scenarios"`
	ArtifactDir string           `json:"artifactDir"`
}

type OperationRun struct {
	Operation    OperationName `json:"operation"`
	RunID        string        `json:"runId"`
	ArtifactDir  string        `json:"artifactDir"`
	ManifestPath string        `json:"manifestPath"`
	ResultsPath  string        `json:"resultsPath"`
	SummaryPath  string        `json:"summaryPath"`
}

type LatencyStats struct {
	Count        int     `json:"count"`
	MinMS        float64 `json:"minMs"`
	MaxMS        float64 `json:"maxMs"`
	MeanMS       float64 `json:"meanMs"`
	P50MS        float64 `json:"p50Ms"`
	P95MS        float64 `json:"p95Ms"`
	P99MS        float64 `json:"p99Ms"`
	OpsPerSecond float64 `json:"opsPerSecond"`
	TotalWallMS  float64 `json:"totalWallMs"`
}

type OperationResult struct {
	Operation  OperationName `json:"operation"`
	ScenarioID string        `json:"scenarioId"`
	Bucket     string        `json:"bucket"`
	Stats      LatencyStats  `json:"stats"`
}

type BenchmarkResults struct {
	RunID     string            `json:"runId"`
	CreatedAt string            `json:"createdAt"`
	Results   []OperationResult `json:"results"`
}

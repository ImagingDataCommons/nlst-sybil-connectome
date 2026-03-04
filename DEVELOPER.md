# Developer Guide

## Prerequisites

* Python 3.9+
* [idc-index](https://github.com/ImagingDataCommons/idc-index) (`pip install idc-index`)
* Google Cloud account with BigQuery access (for the data pipeline notebooks)

## Data Pipeline

The data pipeline runs in Google Colab via two notebooks in `notebooks/`:

1. **`create_connectome_data_table.ipynb`** — Uploads embedding pickle files from `embeddings/` to BigQuery, computes pairwise cosine distances across all 9 models, maps patients to their NLST-Sybil SR via `ReferencedSeriesSequence`, and constructs IDC OHIF Viewer URLs. Produces `connectome_data.csv` (~376 MB, ~374K rows).

2. **`create_cbir_demo.ipynb`** — Exports `connectome_data.csv` to a public GCS bucket and deploys the dashboard.

## Rebuilding the Dashboard

The dashboard HTML (`docs/index.html`) embeds all data as JavaScript constants:

| Constant | Description | Source |
|----------|-------------|--------|
| `MATCH_DATA` | Top-5 closest + farthest matches per patient per model | `connectome_data.csv` |
| `VIEWER_URLS` | IDC OHIF Viewer URLs per patient | `connectome_data.csv` |
| `THUMBNAIL_URLS` | DICOMweb rendered URLs for tumor center CT slices | `embeddings/*.pkl` (SOPInstanceUID) + VIEWER_URLS (StudyInstanceUID) |
| `CANCER_DATA` | Cancer type (ICD-O-3) and AJCC stage per patient | `connectome_data.csv` |
| `CLINICAL_DATA` | Age, sex, race, smoking status per patient | `idc-index` (NLST clinical tables) |

### Regenerating clinical data

```python
from idc_index import IDCClient
client = IDCClient()
client.fetch_index("clinical_index")
df = client.get_clinical_table("nlst_prsn")
# Filter to 289 patients, extract age/sex/race/smoking
```

### CT slice thumbnails

Thumbnails are not embedded in the HTML. They are fetched lazily at runtime from the [IDC DICOMweb proxy](https://learn.canceridc.dev/data/downloading-data/dicomweb-access) using the `THUMBNAIL_URLS` constant. Each URL points to the `/rendered` endpoint for the CT slice at the tumor center (identified by the `SOPInstanceUID` in the embedding pickle files). Images are cached client-side after the first fetch.

## Development Tools

The network visualization and data integration were developed with the assistance of [Claude Code](https://claude.ai/claude-code) using the [IDC Claude skill](https://github.com/ImagingDataCommons/idc-claude-skill) for querying clinical metadata via [idc-index](https://github.com/ImagingDataCommons/idc-index).

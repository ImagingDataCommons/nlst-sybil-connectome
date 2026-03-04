# NLST Sybil Tumor Connectome

A content-based image retrieval (CBIR) connectome that visualizes **tumor-level similarity** between 289 lung cancer patients from the [National Lung Screening Trial (NLST)](https://www.cancer.gov/types/lung/research/nlst). For each patient, the tumor region is defined by bounding boxes from the [NLST-Sybil](https://doi.org/10.5281/zenodo.15643334) analysis results collection, and feature embeddings are extracted from these regions using 9 foundation models. The connectome shows which tumors look most (and least) alike according to each model.

### Why 289 Patients?

The NLST-Sybil collection contains tumor annotations for a larger set of patients, but some patients have multiple annotated lesions. To simplify the analysis to one embedding per patient per model, **only patients with exactly one annotated lesion are included**, resulting in 289 patients. This avoids the ambiguity of how to compare patients with multiple tumors (e.g., closest lesion, average embedding, all pairwise combinations).

All imaging data, lesion annotations and clinical data are sourced from [NCI Imaging Data Commons (IDC)](https://imaging.datacommons.cancer.gov/).

This project originated at [NA-MIC Project Week 44](https://projectweek.na-mic.org/PW44_2026_GranCanaria/Projects/ExplorationOfFoundationModelsAndTheirEmbeddingsForOtherTasksUsingTheCloud/) (Gran Canaria, 2026).

## 🚀 Overview

The visualization shows **all 289 patients simultaneously** as a force-directed graph. Each node is a patient; edges connect each patient to its 5 most similar (or most dissimilar) matches based on cosine distance between tumor region embeddings. Nodes cluster spatially by embedding similarity — patients whose tumors have similar feature representations appear closer together.

### Key Features

* **Full Network Visualization**: All patients rendered simultaneously in a force-directed layout — nodes sized by connectivity, edges weighted by cosine distance.
* **Multi-Model Support**: Compare results across 9 foundation models (CTClipVit, CTFM, FMCIB, Merlin, ModelsGen, PASTA, SUPREME, VISTA3D, Voco).
* **Most Similar / Least Similar Toggle**: Switch between viewing the 5 closest and 5 farthest matches per patient to explore both similarity clusters and outlier relationships.
* **Clinical Coloring**: Color nodes by 6 clinical facets — Sex, Age, Race, Smoking Status, Cancer Type, and Stage.
* **IDC Viewer Integration**: Click any node to open the CT scan and NLST-Sybil tumor annotation SR in the [IDC OHIF Viewer](https://viewer.imaging.datacommons.cancer.gov/).
* **Self-Contained**: All data embedded directly in the HTML (~700 KB) — no server or runtime data fetching needed.
* **Interactive Detail Panel**: Click any node to see clinical data, IDC viewer links, and outgoing/incoming match lists.

## 📊 Data Sources

* **Imaging Data**: Low-dose CT scans from the [NLST collection on IDC](https://portal.imaging.datacommons.cancer.gov/explore/filters/?collection_id=nlst). All imaging data accessed via IDC is subject to the [IDC Data Use Agreement](https://datacommons.cancer.gov/data/imaging-data-commons).
* **Tumor Annotations**: Bounding boxes of suspicious lesions produced by [Sybil](https://github.com/reginabarzilaygroup/Sybil) (Mikhael et al., *JCO* 2023), converted to DICOM Structured Reports and hosted on IDC as the [NLST-Sybil](https://doi.org/10.5281/zenodo.15643334) analysis results collection (Krishnaswamy, Clunie & Fedorov, 2025). These bounding boxes define the tumor regions from which foundation model embeddings are extracted.
* **Foundation Model Embeddings**: Each of the 9 foundation models (see below) is applied to the tumor region defined by the NLST-Sybil bounding box to produce a feature vector per patient. Pairwise cosine distances between all 289 patients are computed via BigQuery.
* **Clinical Metadata**: Age, sex, race, and smoking status queried from the NLST clinical tables via [idc-index](https://github.com/ImagingDataCommons/idc-index).
* **Cancer Annotations**: Cancer type (ICD-O-3 morphology) and AJCC stage from the NLST clinical data.

### Foundation Models

| Model | Reference |
|-------|-----------|
| CT-CLIP (CTClipVit) | Hamamci et al., *Nature Biomedical Engineering* (2025). [doi:10.1038/s41551-025-01599-y](https://doi.org/10.1038/s41551-025-01599-y) |
| CT-FM | Pai et al., "Vision Foundation Models for Computed Tomography" (2025). [arXiv:2501.09001](https://arxiv.org/abs/2501.09001) |
| FMCIB | Pai et al., *Nature Machine Intelligence* **6**, 354–367 (2024). [doi:10.1038/s42256-024-00807-9](https://doi.org/10.1038/s42256-024-00807-9) |
| Merlin | Blankemeier et al., "Merlin: A Vision Language Foundation Model for 3D CT" (2024). [arXiv:2406.06512](https://arxiv.org/abs/2406.06512) |
| ModelsGenesis | Zhou et al., *MICCAI* **11767**, 384–393 (2019). [doi:10.1007/978-3-030-32251-9_42](https://doi.org/10.1007/978-3-030-32251-9_42) |
| PASTA | Lei et al., "A Data-Efficient Pan-Tumor Foundation Model for Oncology CT" (2025). [arXiv:2501.10785](https://arxiv.org/abs/2501.10785) |
| SuPreM | Li, Yuille & Zhou, "How Well Do Supervised 3D Models Transfer to Medical Imaging Tasks?" (2025). [arXiv:2501.11253](https://arxiv.org/abs/2501.11253) |
| VISTA3D | He et al., "VISTA3D: Versatile Imaging SegmenTation and Annotation Model for 3D CT" (2024). [arXiv:2406.05285](https://arxiv.org/abs/2406.05285) |
| VoCo | Wu, Zhuang & Chen, *IEEE TPAMI* (2025). [doi:10.1109/TPAMI.2025.3639593](https://doi.org/10.1109/TPAMI.2025.3639593) |

## 🛠️ Data Pipeline (Colab / BigQuery)

The data pipeline runs in Google Colab using BigQuery:

1. **Tumor Region Definition**: NLST-Sybil bounding boxes define the tumor region of interest for each patient.
2. **Embedding Extraction**: Each of the 9 foundation models extracts a feature vector from the tumor region.
3. **Distance Calculation**: Pairwise cosine distances computed between all 289 patients for each model.
4. **SR Mapping**: BigQuery queries link patients to their NLST-Sybil tumor annotation Structured Reports by navigating the DICOM `ReferencedSeriesSequence` hierarchy.
5. **URL Generation**: Constructs IDC OHIF Viewer URLs that open both the CT series and the NLST-Sybil SR.

## 📁 Repository Structure

```
├── LICENSE                 Apache 2.0
├── README.md
├── docs/
│   └── index.html          Dashboard (self-contained, ~790 KB)
├── embeddings/
│   └── *_features.pkl      Embedding pickle files (9 foundation models)
└── notebooks/
    ├── create_connectome_data_table.ipynb   BigQuery pipeline
    └── create_cbir_demo.ipynb              GCS deployment
```

## 📊 Dashboard

The dashboard is a fully self-contained single-file web application (`docs/index.html`) with all data embedded as JavaScript constants. No server, no CSV fetching, no CORS configuration needed.

Simply open `docs/index.html` in a modern web browser. The only external dependency is [Apache ECharts](https://echarts.apache.org/) (loaded from CDN). CT slice thumbnails are loaded on demand from the [IDC DICOMweb proxy](https://learn.canceridc.dev/data/downloading-data/dicomweb-access).

## 🔗 Links

* **Live Demo**: [NLST Sybil Tumor Connectome](https://imagingdatacommons.github.io/nlst-sybil-connectome/)
* **IDC Portal**: [Imaging Data Commons](https://imaging.datacommons.cancer.gov/)
* **NLST on IDC**: [NLST Collection](https://portal.imaging.datacommons.cancer.gov/explore/filters/?collection_id=nlst)

## 🛠️ Developer Guide

See [DEVELOPER.md](DEVELOPER.md) for prerequisites, data pipeline details, and instructions for rebuilding the dashboard.

## Acknowledgments

This project uses data from the [NCI Imaging Data Commons](https://imaging.datacommons.cancer.gov/) (IDC), which is a cloud-based environment containing publicly available cancer imaging data co-located with analysis and exploration tools and resources. IDC is a node within the [Cancer Research Data Commons (CRDC)](https://datacommons.cancer.gov/) infrastructure of the U.S. National Cancer Institute.

If you use this work, please cite:

> Fedorov, A., Longabaugh, W.J.R., Pot, D. *et al.* NCI Imaging Data Commons. *Cancer Res* **81**, 4188–4193 (2021). https://doi.org/10.1158/0008-5472.CAN-21-0950

> Mikhael, P.G., Wohlwend, J., Golia Pernicka, J.S. *et al.* Sybil: A Validated Deep Learning Model to Predict Future Lung Cancer Risk From a Single Low-Dose Chest CT. *J Clin Oncol* **41**, 2191–2200 (2023). https://doi.org/10.1200/JCO.22.01345

> Krishnaswamy, D., Clunie, D. A., & Fedorov, A. (2025). *NLST-Sybil: Expert annotations of tumor regions in the NLST CT images* [Data set]. Zenodo. https://doi.org/10.5281/zenodo.15643334

---

Deepa Krishnaswamy and Andrey Fedorov

Brigham and Women's Hospital

March 2026

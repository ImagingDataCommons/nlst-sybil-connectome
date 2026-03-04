# NLST CBIR Connectome 

An interactive visualization tool for exploring lung cancer CT scan similarities using various Foundation Models (FMs). This project maps patients from the National Lung Screening Trial (NLST) 
based on embedding distances and provides direct integration with the IDC (Imaging Data Commons) Viewer to visualize Sybil tumor bounding boxes as Structured Reports (SR) alongside original imaging.

## 🚀 Overview

This repository contains the code for a Content-Based Image Retrieval (CBIR) "Connectome." The network visualization shows **all 289 patients simultaneously** as a force-directed graph, with edges connecting each patient to its 5 most similar (or most dissimilar) matches in the embedding space of 9 foundation models.

### Key Features

* **Full Network Visualization**: All patients rendered simultaneously in a force-directed layout with ECharts — nodes sized by connectivity, edges weighted by cosine distance.
* **Multi-Model Support**: Compare results across 9 foundation models (CTClipVit, CTFM, FMCIB, Merlin, ModelsGen, PASTA, SUPREME, VISTA3D, Voco).
* **Most Similar / Least Similar Toggle**: Switch between viewing the 5 closest and 5 farthest matches per patient to explore both similarity clusters and outlier relationships.
* **Clinical Coloring**: Color nodes by 6 clinical facets — Sex, Age, Race, Smoking Status, Cancer Type, and Stage.
* **Sybil Integration**: IDC Viewer links open both the original CT series and the Sybil Structured Report with tumor bounding boxes.
* **Self-Contained**: All data embedded directly in the HTML — no runtime network requests or CSV parsing needed.
* **Interactive Detail Panel**: Click any node to see clinical data, IDC viewer links, and outgoing/incoming match lists.

## 🛠️ Data Pipeline (Colab / BigQuery)

The backend logic is designed to run in a Google Colab environment using BigQuery. The pipeline consists of:

1. **SR Mapping**: A query that navigates the complex DICOM hierarchy (`CurrentRequestedProcedureEvidenceSequence` → `ReferencedSeriesSequence`) to link patients to their Sybil SR files.
2. **Distance Calculation**: Joins embedding distances with patient metadata.
3. **URL Generation**: Constructs interactive links for the IDC Viewer

## 📊 Dashboard

The dashboard is a fully self-contained single-file web application (`site/index.html`) with all data embedded as JavaScript constants (~700 KB total). No server, no CSV fetching, no CORS configuration needed.

### Local Development

Simply open `site/index.html` in a modern web browser. The only external dependency is **Apache ECharts** (loaded from CDN).

## 📁 Repository Structure

* `features`: Directory with the features pickle files from each of the foundation models.
* `site/index.html`: The interactive dashboard.
* `create_connectome_data_table.ipynb`: Colab notebook containing the BigQuery logic to create the connectome_data.csv file, using the feature pickle files. 
* `create_cbir_demo.ipynb`: Colab notebook that creates the necessary public access bucket with the site/index.html and the connectome_data.csv file. 


## 🔗 Links

* **Live Demo**: [NLST Sybil Connectome](https://storage.googleapis.com/nlst_cbir_connectome/site/index.html)
* **Data Source**: [Imaging Data Commons (IDC)](https://imaging.datacommons.cancer.gov/)

## 🤖 Development Tools

The network visualization and data integration were developed with the assistance of [Claude Code](https://claude.ai/claude-code) using the [IDC Claude skill](https://github.com/ImagingDataCommons/idc-claude-skill) for querying clinical metadata via [idc-index](https://github.com/ImagingDataCommons/idc-index).

---
*Developed for research and visualization of lung cancer foundation models.*

Deepa Krishnaswamy and Andrey Fedorov

Brigham and Women's Hospital

March 2026

# NLST CBIR Connectome 

An interactive visualization tool for exploring lung cancer CT scan similarities using various Foundation Models (FMs). This project maps patients from the National Lung Screening Trial (NLST) 
based on embedding distances and provides direct integration with the IDC (Imaging Data Commons) Viewer to visualize Sybil tumor bounding boxes as Structured Reports (SR) alongside original imaging.

## 🚀 Overview

This repository contains the code for a Content-Based Image Retrieval (CBIR) "Connectome." By selecting a Foundation Model and a Query Patient, users can visualize the top 5 most similar patients (neighbors) in the latent space.

### Key Features

* **Multi-Model Support**: Compare results across different foundation models (e.g., CT-Clip, ViT, etc.).
* **Sybil Integration**: Automatically maps single-lesion patients to their corresponding Sybil Structured Reports.
* **Dual-Series Viewing**: Dynamic URL generation that opens the IDC Viewer with both the original CT series and the Sybil overlay pre-loaded.
* **Interactive Connectome**: A high-performance SVG/Canvas graph built with Apache ECharts for exploring patient relationships.

## 🛠️ Data Pipeline (Colab / BigQuery)

The backend logic is designed to run in a Google Colab environment using BigQuery. The pipeline consists of:

1. **SR Mapping**: A query that navigates the complex DICOM hierarchy (`CurrentRequestedProcedureEvidenceSequence` → `ReferencedSeriesSequence`) to link patients to their Sybil SR files.
2. **Distance Calculation**: Joins embedding distances with patient metadata.
3. **URL Generation**: Constructs interactive links for the IDC Viewer

## 📊 Dashboard Setup

The dashboard is a single-file web application (`index.html`) that consumes a hosted CSV file.

### Prerequisites

* A hosted CSV file (e.g., on Google Cloud Storage) containing:
  * `model_name`, `q_PatientID`, `similarity_pct`, `q_viewer_url_series`, `m_viewer_url_series`, etc.
* **CORS Configuration**: Ensure your storage bucket allows GET requests from the domain where the dashboard is hosted.

### Local Development

Simply open `index.html` in a modern web browser. The dashboard uses:

* **Tailwind CSS**: For a modern, dark-mode UI.
* **Apache ECharts**: For the force-directed/circular graph visualization.
* **PapaParse**: For efficient client-side CSV parsing.

## 📁 Repository Structure

* `features`: Directory with the features pickle files from each of the foundation models.
* `site/index.html`: The interactive dashboard.
* `create_connectome_data_table.ipynb`: Colab notebook containing the BigQuery logic to create the connectome_data.csv file, using the feature pickle files. 
* `create_cbir_demo.ipynb`: Colab notebook that creates the necessary public access bucket with the site/index.html and the connectome_data.csv file. 


## 🔗 Links

* **Live Demo**: [NLST Sybil Connectome](https://storage.googleapis.com/nlst_cbir_connectome/site/index.html)
* **Data Source**: [Imaging Data Commons (IDC)](https://imaging.datacommons.cancer.gov/)

---
*Developed for research and visualization of lung cancer foundation models.*

Deepa Krishnaswamy and Andrey Fedorov

Brigham and Women's Hospital 

March 2026 

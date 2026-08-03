# 🔍 DataLens – Data Quality Impact Investigator

> **AI-inspired Data Quality Analysis System that detects, evaluates, and explains data quality issues with business impact analysis.**

---

## 📖 Project Overview

DataLens is a modular Python application designed to investigate data quality rather than simply detecting errors.

Most data quality tools only report issues like:

* "Salary column contains 8% missing values."
* "Dataset has 5 duplicate records."

DataLens goes beyond simple detection by answering questions such as:

* Which issues are the most critical?
* What business impact can they cause?
* How severe are the problems?
* What recommendations should be followed?
* What is the overall health of the dataset?

The project follows a clean layered architecture inspired by real-world software engineering practices, making it scalable, maintainable, and easy to extend.

---

# 🎯 Problem Statement

Poor data quality leads to incorrect analysis, unreliable machine learning models, and poor business decisions.

Most beginner data analysis projects only detect issues.

**DataLens investigates them.**

It not only identifies problems but also evaluates their severity, estimates business impact, and provides actionable recommendations.

---

# ✨ Features

## Dataset Overview

* Dataset dimensions
* Numeric columns
* Categorical columns
* Datetime columns
* Memory usage
* Missing value count
* Duplicate record count

---

## Missing Value Analysis

* Missing percentage
* Severity classification
* Business impact
* Recommendation

---

## Duplicate Record Analysis

* Duplicate count
* Duplicate percentage
* Duplicate records
* Severity analysis
* Business impact
* Recommendation

---

## Datatype Validation

* Expected datatype
* Detected datatype
* Invalid values
* Invalid percentage
* Severity analysis
* Recommendation

---

## Outlier Detection

* IQR-based detection
* Outlier count
* Outlier percentage
* Severity analysis
* Recommendation

---

## Dataset Dashboard

* Dataset Health Score
* Dataset Status
* Highest Priority Issue
* Score Breakdown

---

# 🏗 Project Architecture

```text
                DataLens

                     │

             analysis_engine.py

                     │

      ┌──────────────┼──────────────┐

      ▼              ▼              ▼

 Services        Reports        Configuration

      │              │              │

      ▼              ▼              ▼

 Business       Final Reports     Rules
 Logic
```

---

# 📂 Project Structure

```text
DataLens/

│

├── config/

│   ├── datatype_config.py

│   └── severity.py

│

├── services/

│   ├── dashboard_service.py

│   ├── datatype_service.py

│   ├── outlier_service.py

│   └── quality_service.py

│

├── reports/

│   ├── overview.py

│   ├── missing.py

│   ├── duplicate.py

│   ├── datatype.py

│   ├── outlier.py

│   └── dashboard.py

│

├── engine/

│   └── analysis_engine.py

│

├── data/

│   ├── raw/

│   └── sample/

│

├── notebooks/

│

├── output/

│

├── main.py

└── README.md
```

---

# 🛠 Technologies Used

* Python
* Pandas
* NumPy
* Jupyter Notebook
* Git
* GitHub

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/Arman-mn-0312/DataLens.git
```

Move into the project directory:

```bash
cd DataLens
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the project:

```bash
python main.py
```

---

# 🔄 Project Workflow

```text
CSV Dataset

↓

Overview Report

↓

Missing Value Report

↓

Duplicate Report

↓

Datatype Report

↓

Outlier Report

↓

Dashboard Report

↓

Final Analysis
```

---

# 📊 Current Capabilities

✔ Dataset Profiling

✔ Missing Value Analysis

✔ Duplicate Detection

✔ Datatype Validation

✔ Outlier Detection

✔ Severity Classification

✔ Business Impact Generation

✔ Recommendation Generation

✔ Dataset Health Score

✔ Modular Report Generation

---

# 🚀 Future Roadmap

The Advanced Level will include:

* Flask Web Application
* CSV Upload Interface
* Interactive Dashboard
* Charts & Visualizations
* AI-powered Business Insights
* Report Export (PDF / Excel)
* REST API
* Deployment

---

# 👨‍💻 Author

**Arman Mansuri**

MCA Student | Data Science Enthusiast

GitHub:
https://github.com/Arman-mn-0312

---

# ⭐ If you like this project

Please consider giving this repository a ⭐ on GitHub.

# Task/Project Management Tool

## Overview
The **Task/Project Management Tool** is an open-source web application built using Django. It is designed to help teams and individuals manage tasks and projects efficiently. With features like task assignment, status tracking, and project overviews, this tool simplifies collaboration and enhances productivity.

---

## Features

### 1. User Authentication
- Secure login and registration system.
- Role-based access: Admins and Team Members.

### 2. Project Management
- Create, update, and delete projects.
- Assign team members to projects.
- View project details with associated tasks.

### 3. Task Management
- Create, assign, and prioritize tasks.
- Task status tracking (To-do, In Progress, Completed).
- Deadline management and reminders.

### 4. Notifications
- Email notifications for task assignments and approaching deadlines.

### 5. Reporting
- Dashboard with visual progress reports for projects and tasks.

### 6. Optional Features
- Kanban Board view for task organization.
- Comments on tasks for collaboration.

---

## Installation Guide

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Njoro90260/project-management-tool.git
   cd project-management-tool
   ```

2. **Set up a Virtual Environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a Superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the Development Server:**
   ```bash
   python manage.py runserver
   ```

7. **Access the Application:**
   Open your browser and go to `http://127.0.0.1:8000`.

---

## Contributing Guide

We welcome contributions to improve this tool! Follow the steps below to contribute:

### 1. Fork the Repository
- Click on the `Fork` button at the top-right corner of this repository.

### 2. Clone Your Fork
- Clone the forked repository to your local machine:
  ```bash
  git clone https://github.com/Njoro90260/project-management-tool.git
  ```

### 3. Create a Feature Branch
- Create a new branch for your feature or fix:
  ```bash
  git checkout -b feature/your-feature-name
  ```

### 4. Make Changes
- Implement your changes or features.
- Ensure code adheres to the project’s style guidelines.

### 5. Test Your Changes
- Run tests to verify everything works as expected:
  ```bash
  python manage.py test
  ```

### 6. Commit and Push
- Commit your changes with a descriptive message:
  ```bash
  git add .
  git commit -m "Add: [Feature] Describe your feature"
  git push origin feature/your-feature-name
  ```

### 7. Submit a Pull Request
- Go to the original repository and click `Pull Request`.
- Provide a clear description of your changes and the motivation behind them.

---

## License
This project is licensed under the **GNU General Public License (GPL)**. See the `LICENSE` file for more details.

---

## Contact
For questions or support, reach out to:
- **Email:** [Email me!](mailto:wchegesalome@gmail.com)
- **GitHub:** [Njoro90260](https://github.com/Njoro90260)

---

Thank you for contributing and using the Task/Project Management Tool! 🎉

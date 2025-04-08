# Use the official Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory
WORKDIR /code

# Install system dependencies
RUN apt-get update \
    && apt-get install -y netcat-openbsd gcc postgresql-client \
    && pip install --upgrade pip

# Copy the project files
COPY . /code/

# Install Python dependencies
RUN pip install -r requirements.txt

# Run Django commands through docker-compose later

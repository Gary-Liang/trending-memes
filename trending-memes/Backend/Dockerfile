# Use an official Python runtime as the base image
FROM python:3.9

# Set the working directory in the container
# WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code to the container
COPY . .

# Set the environment variable for Flask
ENV FLASK_APP=app.py

# Expose the port on which the Flask app will run
EXPOSE 5000

# Run the Flask application using gunicorn
CMD ["sh", "-c", "cd API && gunicorn routes:app"]

# Use an official Python runtime as the base image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install the dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code to the container
COPY . .

# Set the environment variables
ENV BROWSER=chrome
ENV CLIENT_ID=2a8dc814ec9b733
ENV DEBUG=False
ENV FLASK_ENV=production
ENV MONGO_CLIENT=mongodb://mongo:D3n2sBIoKWnrR4uWr3Q7@containers-us-west-200.railway.app:6613
ENV PYTHON_PATH=/trending-memes/backend/Scripts/python.exe
ENV REDIRECT_URI=https://trending-memes-production.up.railway.app/callback
ENV REDIS_HOST=containers-us-west-19.railway.app
ENV REDIS_PASSWORD=BcL63ztfDKb1KGbbl6cx
ENV SECRET_KEY=229fe708a804320842795e6cd7ca32d0f0ded430
ENV SESSION_SECRET_KEY=TUgLOBR-YV0i5C_lrtqgny0S2q4vZracbicwDRVq7Lo

# Set the environment variable for Flask
ENV FLASK_APP=app.py

# Expose the port on which the Flask app will run
EXPOSE 5000

# Run the Flask application using gunicorn
CMD ["sh", "-c", "cd API && gunicorn routes:app"]

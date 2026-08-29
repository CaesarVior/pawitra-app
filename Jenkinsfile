pipeline {
    agent any

    environment {
        APP_NAME = "pawitra-app"
        CONTAINER_NAME = "pawitra_container"
        IMAGE_TAG = "pawitra-app:${BUILD_NUMBER}"
        LATEST_TAG = "pawitra-app:latest"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Downloading source code for ${env.APP_NAME}..."
            }
        }

        stage('Lint & Validate') {
            steps {
                echo "Checking required files..."
                sh 'test -f index.html || (echo "index.html not found!" && exit 1)'
                sh 'test -f Dockerfile || (echo "Dockerfile not found!" && exit 1)'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image version ${env.BUILD_NUMBER}..."
                sh "docker build -t ${env.IMAGE_TAG} -t ${env.LATEST_TAG} ."
            }
        }

        stage('Deploy Container') {
            steps {
                echo "Deploying ${env.CONTAINER_NAME} using Docker Compose..."
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo "Checking container health..."
                sleep 5
                sh "docker ps | grep ${env.CONTAINER_NAME}"
            }
        }
    }

    post {
        always {
            echo "Cleaning up unused Docker images..."
            sh 'docker image prune -f'
        }
        success {
            echo "Deployment successfully completed for ${env.APP_NAME}!"
        }
        failure {
            echo "Deployment failed! Please check logs."
        }
    }
}
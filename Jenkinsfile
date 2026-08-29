pipeline {
    agent any

    environment {
        APP_NAME = "pawitra-app"
        CONTAINER_NAME = "pawitra_container"
        IMAGE_TAG = "pawitra-app:${BUILD_NUMBER}"
        LATEST_TAG = "pawitra-app:latest"
        APP_PORT = "8011"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "Downloading source code for ${env.APP_NAME}..."
            }
        }

        stage('Lint & Validate') {
            steps {
                echo "Checking required files and directories..."
                sh 'test -f views/home/index.html || (echo "views/home/index.html not found!" && exit 1)'
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
                echo "Deploying ${env.CONTAINER_NAME} on port ${env.APP_PORT}..."
                sh 'docker compose down || true'
                sh 'docker compose up -d --build'
            }
        }

        stage('Health Check') {
            steps {
                echo "Checking application health on port ${env.APP_PORT}..."
                sleep 5
                sh "curl -f http://localhost:${env.APP_PORT} || exit 1"
            }
        }
    }

    post {
        always {
            echo "Cleaning up unused Docker images..."
            sh 'docker image prune -f'
        }
        success {
            echo "Deployment successful! Access app at http://localhost:${env.APP_PORT}"
        }
        failure {
            echo "Deployment failed! Check Jenkins console output for details."
        }
    }
}
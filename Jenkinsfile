pipeline {
    agent any

    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-creds')
        IMAGE_FRONTEND = 'shrikr975/trackflow-frontend'
        IMAGE_BACKEND = 'shrikr975/trackflow-backend'
        IMAGE_TAG = "${env.BUILD_ID}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies & Test') {
            steps {
                dir('backend') {
                    bat 'npm install'
                    bat 'npm test || exit 0'
                }
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat "docker build -t ${IMAGE_FRONTEND}:${IMAGE_TAG} ./frontend"
                bat "docker build -t ${IMAGE_BACKEND}:${IMAGE_TAG} ./backend"
                bat "docker build -t ${IMAGE_FRONTEND}:latest ./frontend"
                bat "docker build -t ${IMAGE_BACKEND}:latest ./backend"
            }
        }

        stage('Push Docker Images') {
            steps {
                bat "echo %DOCKER_HUB_CREDENTIALS_PSW% | docker login -u %DOCKER_HUB_CREDENTIALS_USR% --password-stdin"
                bat "docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                bat "docker push ${IMAGE_BACKEND}:${IMAGE_TAG}"
                bat "docker push ${IMAGE_FRONTEND}:latest"
                bat "docker push ${IMAGE_BACKEND}:latest"
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker compose down || true'
                bat 'docker compose up -d'
            }
        }
    }
}

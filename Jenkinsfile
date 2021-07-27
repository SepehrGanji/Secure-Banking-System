pipeline {
  agent any
  stages {
    stage('Install Packages') {
      steps {
        sh 'npm install'
      }
    }

    stage('Start Server') {
      steps {
        sh 'npm run server'
      }
    }

    stage('Start Client') {
      steps {
        sh 'npm run client'
        echo 'All done!'
      }
    }

  }
}
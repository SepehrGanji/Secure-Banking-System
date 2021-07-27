pipeline {
  agent any
  stages {
    stage('Start MongoDB') {
      parallel {
        stage('Start MongoDB') {
          steps {
            sh 'docker run -d --rm -v sec_database:/data/db -p 4000:27017 --name mongosec mongo'
          }
        }

        stage('Install Packages') {
          steps {
            sh 'npm install'
          }
        }

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
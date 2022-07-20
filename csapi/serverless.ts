import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'csapi',
  frameworkVersion: '2',
  custom: {
    serverlessLayers: {
      layerDeploymentBucket: 'ace-serverless-layer-s3'
    },
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  // Add the serverless-webpack plugin
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    lambdaHashingVersion: 20201221,
    region: 'ap-northeast-1',
    stage: 'dev',
    timeout: 360, // 一応6分
    environment: {
      EXECUTION_ENVIRONMENT: 'lambda',
      GOOGLE_API_KEY: 'AIzaSyD1bO8gquXaVoFXUHrhQSqkMQCTtFkYe7A',
      CUSTOM_SEARCH_ENGINE_ID: '9deeacfea512eec4d',
      API_BASE: 'https://8ab38c04c215.ngrok.io/',
      API_APPEND: 'api/robots/success/csapi/data',
      API_ENDPOINT: 'api/robots/success/csapi',
      API_ENDPOINT_FAILURE: 'api/robots/failure'
    },
  },
  functions: {
    main: {
      handler: 'handler.main',
      events: [
        {
          sns: {
            arn: 'arn:aws:sns:ap-northeast-1:170991654215:ACE-SCRAPING-SNS',
            filterPolicy: {
              type: ['csapi']
            }
          }
        }
      ],
      reservedConcurrency: 30
    }
  }
}

module.exports = serverlessConfiguration;

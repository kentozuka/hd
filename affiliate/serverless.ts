import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'affiliate',
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
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    lambdaHashingVersion: 20201221,
    region: 'ap-northeast-1',
    stage: 'dev',
    timeout: 899,
    environment: {
      EXECUTION_ENVIRONMENT: 'lambda',
      API_BASE: 'https://8ab38c04c215.ngrok.io/',
      API_ENDPOINT: 'api/robots/success/affiliate',
      API_ENDPOINT_FAILURE: 'api/robots/failure',
      PPTR_SOFTLIMIT: 850,
      PPTR_LEN: 50,
      PPTR_MAX: 5000
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
              type: ['affiliate']
            }
          }
        }
      ],
      reservedConcurrency: 300,
      memorySize: 3072
    }
  }
}

module.exports = serverlessConfiguration;

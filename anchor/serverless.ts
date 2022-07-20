import type { Serverless } from 'serverless/aws';

const serverlessConfiguration: Serverless = {
  service: 'anchor',
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
    timeout: 300, // 一応3分
    environment: {
      EXECUTION_ENVIRONMENT: 'lambda',
      API_BASE: 'https://8ab38c04c215.ngrok.io/',
      API_ENDPOINT: 'api/robots/success/anchor',
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
              type: ['anchor']
            }
          }
        }
      ],
      reservedConcurrency: 40
    }
  }
}

module.exports = serverlessConfiguration;

import fs from 'fs-extra';
import Log from 'log';
import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

const DEFAULT_LOG_NAME = 'webpack.txt';

export default class StaticServerLauncher {
  onPrepare({ webpackConfig: baseConfig, webpackDriverConfig: driverConfig,
      webpackLog: logging }) {
    if (!baseConfig && !driverConfig) {
      return Promise.resolve();
    }

    this.baseConfig = baseConfig;
    this.driverConfig = driverConfig;

    if (logging) {
      let stream;
      if (typeof logging === 'string') {
        const file = path.join(logging, DEFAULT_LOG_NAME);
        fs.createFileSync(file);
        stream = fs.createWriteStream(file);
      }
      this.log = new Log('debug', stream);
    } else {
      this.log = new Log('emergency');
    }

    if (this.driverConfig) {
      this.config = merge.smart(baseConfig, driverConfig);
    } else {
      this.config = baseConfig;
    }

    this.bundler = webpack(this.config);

    return new Promise((resolve, reject) => {
      this.bundler.run((err, stats) => {
        if (err) {
          reject(err);
        }

        this.log.info(stats.toString({ chunks: false, colors: logging === true }));
        resolve();
      });
    });
  }

}

const cluster = require("cluster");
const os = require("os");
const db = require("./models/");
const app = require("./app");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
// this will decide if we cluster our app
ALLOW_CLUSTERING = false;
// server.js
if (ALLOW_CLUSTER) {
  const numCPUs = os.cpus().length;

  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
    });
  } else {
    // Workers share the TCP connection in this server
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, //  Capture 100% of the transactions
      // Set sampling rate for profiling - this is relative to tracesSampleRate
      profilesSampleRate: 1.0,
    });
    // The request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());
    // TracingHandler creates a trace for every incoming request
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());

    db.sequelize.sync().then(() => {
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => console.warn(`Server started on port ${PORT}`));
    });

    process.on("SIGTERM", () => {
      console.log(`Worker ${process.pid} received SIGTERM`);
      server.close(() => {
        console.log(`Worker ${process.pid} gracefully exiting`);
        process.exit(0);
      });
    });
  }
} else {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });
  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

  db.sequelize.sync().then(() => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.warn(`Server started on port ${PORT}`));
  });
}

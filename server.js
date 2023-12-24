const db = require("./models/");
const app = require("./app");
const Sentry = require("@sentry/node");
const { ProfilingIntegration } = require("@sentry/profiling-node");
Sentry.init({
  dsn: "https://4fe486c2ef01fd93c10d0a38f22cf426@o4506450129125376.ingest.sentry.io/4506450130632704",
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

module.exports = {
    url: '/api/clusters',

    setup: ({ router, logger, context, reportUserError }) => {
        router.get('/', function (req, res) {
            return context.clusterEngine.fetchList();
        })

        router.get('/info/:name', function (req, res) {
            return context.clusterEngine.fetchDetails(req.params.name);
        })

        router.get('/active', function (req, res) {
            return context.clusterEngine.getActiveCluster();
        })

        router.post('/active', function (req, res) {
            if (!req.body.name) {
                reportUserError('Missing name.');
            }
            return context.clusterEngine.setActiveCluster(req.body.name);
        })

        router.post('/create-config', function (req, res) {
            if (!req.body.config) {
                reportUserError('Missing config')
            }

            return context.clusterEngine.createConfig(req.body)
        })
    },
}

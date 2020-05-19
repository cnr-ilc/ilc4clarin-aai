'use strict';
(function(window){
  function AAI() {
    var host = 'https://' + window.location.hostname,
        ourEntityID = host.match("dspace-clarin-it.ilc.cnr.it") ? "https://dspace-clarin-it.ilc.cnr.it" : host;
    this.defaults = {
//      host : 'https://ufal-point.mff.cuni.cz',
      host : host, //better default (useful when testing on ufal-point-dev)
      // do not add protocol because an error will appear in the DJ dialog
      // if you see the error, your SP is not listed among djc trusted (edugain is enough to be trusted)
      responseUrl: window.location.protocol + '//dspace-clarin-it.ilc.cnr.it/aai/discojuiceDiscoveryResponse.html',
      ourEntityID: ourEntityID + '/Shibboleth.sso/Metadata',
      serviceName: '',
     metadataFeed: host + '/xmlui/discojuice/feeds',
      //metadataFeed: 'https://lindat.mff.cuni.cz/repository' + '/xmlui/discojuice/feeds',
      selector: 'a.signon', // selector for login button
      autoInitialize: true // auto attach DiscoJuice to DOM
    };
    this.setup = function(options) {
      var opts = jQuery.extend({}, this.defaults, options),
          defaultCallback = function(e) {
            window.location = opts.host + '/Shibboleth.sso/Login?SAMLDS=1&target=' + opts.target + '&entityID=' + window.encodeURIComponent(e.entityID);
          };
      //console.log(opts);
      if(!opts.target){
        throw 'You need to set the \'target\' parameter.';
      }
      // call disco juice setup
      if (!opts.autoInitialize || $(opts.selector).size() > 0) {
        if(! window.DiscoJuice ){
          throw 'Failed to find DiscoJuice. Did you include all that is necessary?';
        }
        var djc = DiscoJuice.Hosted.getConfig(
          opts.serviceName,
          opts.ourEntityID,
          opts.responseUrl,
          [ ],
          opts.host + '/Shibboleth.sso/Login?SAMLDS=1&target='+opts.target+'&entityID=');
        djc.metadata = [opts.metadataFeed];
        djc.subtitle = "Login via Your home institution (e.g. university)";
        djc.textHelp = opts.textHelp;
        djc.textHelpMore = opts.textHelpMore;

        djc.inlinemetadata = typeof opts.inlinemetadata === 'object' ? opts.inlinemetadata : [];
        djc.inlinemetadata.push({
          'country': '_all_',
          'entityID': 'https://idm.clarin.eu',
          'geo': {'lat': 51.833298, 'lon': 5.866699},
          'title': 'Clarin.eu website account',
          'weight': -801
        });
        djc.inlinemetadata.push({
          'country': 'IT',
          'entityID': 'https://idem-idp.ilc.cnr.it/idp/shibboleth',
          'geo': {'lat': '43.718450', 'lon': '10.421310'},
          'title': 'CNR Institute for Computational Linguistics \"Antonio Zampolli\"',
          'weight': -999
        });

        if(opts.localauth) {
          djc.inlinemetadata.push(
            {
              'entityID': 'local://',
              'auth': 'local',
              'title': 'Local authentication',
              'country': '_all_',
              'geo': null,
              'weight': 1000
            });
          djc.callback = function(e){
            var auth = e.auth || null;
            switch(auth) {
              case 'local':
                DiscoJuice.UI.setScreen(opts.localauth);
                jQuery('input#login').focus();
                break;
              //case 'saml':
              default:
                defaultCallback(e);
                break;
            }
          };
        }

        if (opts.callback && typeof opts.callback === 'function') {
          djc.callback = function(e) {
            opts.callback(e, opts, defaultCallback);
          };
        }

        if (opts.autoInitialize) {
          jQuery(opts.selector).DiscoJuice( djc );
        }

        return djc;
      } //if jQuery(selector)
    };
  }

  if (!window.aai) {
    window.aai = new AAI();
  }
})(window);

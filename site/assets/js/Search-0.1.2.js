var FusionAuth = FusionAuth || {};

FusionAuth.Search = function() {
  Prime.Utils.bindAll(this);

  Prime.Document.query('a.search').each(function(e) {
    e.addEventListener('click', this._handleSearchButtonClick);
  }.bind(this));
  Prime.Document.queryFirst('a.search-close').addEventListener('click', this._handleSearchButtonClick);
  Prime.Document.queryById('search-bar').addEventListener('keydown', this._handleKeyDown);

  var searchFunction = this._searchHelperFunction;
  this.searchBar = Prime.Document.queryById('search-bar');
  this.searchClient = algoliasearch('MN6ZCVNV21', 'e65ffc9f8bb352def753e7614de78416');
  this.search = instantsearch(
      {
        indexName: 'website',
        searchClient: this.searchClient,
        searchFunction
      }
  );

  this.search.addWidget(
      instantsearch.widgets.searchBox(
          {
            container: '#search-box',
            placeholder: 'Search the FusionAuth website',
            showReset: false,
            showSubmit: false
          }
      )
  );

  this.search.addWidget(
      instantsearch.widgets.hits(
          {
            container: '#search-results',
            templates: {
              item: this._hitTemplate,
              empty: this._empty,
              escapeHTML: true,
            }
          }
      )
  );

  this.search.addWidgets(
      [
        instantsearch.widgets.analytics(
            {
              pushFunction(formattedParameters, state, results) {
                dataLayer.push(
                    {
                      'event': 'search',
                      'Search Query': state.query,
                      'Facet Parameters': formattedParameters,
                      'Number of Hits': results.nbHits,
                    }
                );
              },
              triggerOnUIInteraction: true,
            }
        )
      ]
  );

  this.search.start();
};

FusionAuth.Search.constructor = FusionAuth.Search;
FusionAuth.Search.prototype = {
  _empty: function(results) {
    return `<ol class="ais-Hits-list">
              <li class="ais-Hits-item">
                <span>No results for: \"${results.query}\"</span>
              </li>
            </ol>`;
  },

  _handleKeyDown: function(event) {
    var currentElement = new Prime.Document.Element(document.activeElement);
    var input = Prime.Document.queryFirst('.ais-SearchBox-input');
    var onInput = currentElement.hasClass('ais-SearchBox-input');
    var onSearchResult = currentElement.hasClass('search-result');
    if (!onSearchResult && !onInput) {
      return;
    }

    switch(event.code) {
      case 'ArrowUp':
        Prime.Utils.stopEvent(event);
        if (!onInput) {
          var previous = currentElement.queryUp('.ais-Hits-item').getPreviousSibling();
          if (previous !== null) {
            previous.queryFirst('.search-result').focus();
          } else {
            input.focus();
          }
        }
        break;
      case 'ArrowDown':
        Prime.Utils.stopEvent(event);
        if (onInput) {
          Prime.Document.queryFirst('.search-result').focus();
        } else {
          var next = currentElement.queryUp('.ais-Hits-item').getNextSibling();
          if (next !== null) {
            next.queryFirst('.search-result').focus();
          }
        }
        break;
    }
  },

  _handleSearchButtonClick: function(event) {
    Prime.Utils.stopEvent(event);
    if (this.searchBar.isVisible()) {
      this.searchBar.hide();
    } else {
      this.searchBar.show();
    }
  },

  _hitTemplate: function(hit) {
    var url = `${FusionAuth.siteURL}${hit.url}#${hit.anchor}`;
    var title = hit._highlightResult.title.value;

    // create a snippet
    var truncateLength = 120;
    var excerpt = hit._highlightResult.content.value.substring(0, truncateLength);
    var spaceIdx = excerpt.lastIndexOf(' ');
    var snippet = excerpt.substring(0, spaceIdx) + "...";

    return `<a class="search-result" href="${url}"><strong>${title}</strong> ${snippet}</a>`;
  },

  _searchHelperFunction: function(helper) {
    var container = document.querySelector('#search-results');
    container.style.display = helper.state.query === '' ? 'none' : '';
    helper.search();
  }
};

Prime.Document.onReady(function() {
  new FusionAuth.Search();
});

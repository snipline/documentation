// This is where it all goes :)

// function loadIndex(){
//   $.getJSON('/search.json', function(data){
//     index = lunr.Index.load(data.index);
//     map = data.map
//   });
// }

// function queryIndex(term) {
//   index.search(term).forEach(function(res){
//     // use the map to get the page title
//     console.log(map[res.ref].title);
//   });
// }

import m from "mithril";
import stream from "mithril/stream";
import lunr from "lunr";
var Turbolinks = require("turbolinks")
Turbolinks.start()

var SearchResults = function() {
    var idx;
    var results = stream([]);
    var showResults = stream(false);
    var pageJson = [];
    var getPage = function(ref) {
        var searchResults = pageJson.filter((result) => {
            return result.path == ref;
        });
        if(searchResults.length > 0) {
            return searchResults[0];
        } else {
            return {};
        }
    }
    return {
        oninit() {
            // TODO: loadIndex
            m.request({ url: "/search.json", data: {} })
            .then(function(result) {
                pageJson = result;
                // Index results into Lunr
                idx = lunr(function () {
                    this.ref('path')
                    this.field('title')
                    this.field('search_terms')
                    this.field('description')

                    result.forEach(function (doc) {
                        this.add(doc)
                    }, this)
                });

            })
        },
        onbeforeupdate(vnode) {
            results(idx.search(vnode.attrs.query));
            showResults(results().length > 0 && vnode.attrs.query.trim().length > 0)
        },
        view(vnode) {
            if(showResults()) {
            return m("div.search--results", [
                m("h3", "Search Results"),
                results().map(function(result) {
                    var page = getPage(result.ref)
                    return m("div.search--result", m("a", {href: `${window.location.protocol}://${window.location.hostname}${page.path}`}, [m("h4", page.title), m("p", page.description)] ));
                })
            ]);
            }
        }
    };
}
var SearchComponent = function() {
    var query = "";
    return {
        view() {
            return [
                m("div.search--wrapper", [
                    m("input#search[name=search][type=search]", {value: query, oninput: function(e) { query = e.target.value; console.log(query) }}),
                    m("button", {class: (query.trim().length > 0 ) ? "search--clear" : 'hidden', onclick: function(e) { query = ""; document.getElementById("search").focus(); } }, m("clr-icon[shape=times]")),
                ]),
                m(SearchResults, {query: query})
            ];
        }
    }
}
document.addEventListener('DOMContentLoaded', function(){ 
    var SearchRoot = document.getElementById("searchbar");
    m.mount(SearchRoot, SearchComponent);
}, false);

document.addEventListener("turbolinks:load", function() {
    var SearchRoot = document.getElementById("searchbar");
    m.mount(SearchRoot, SearchComponent);
})
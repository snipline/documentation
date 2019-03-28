import m from "mithril";
import stream from "mithril/stream";
import lunr from "lunr";
var Turbolinks = require("turbolinks")
Turbolinks.start()

var idx = [], pageJson = [];

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
}).then(function(result) {
    var SearchRoot = document.getElementById("searchbar");
    m.mount(SearchRoot, SearchComponent);
    document.addEventListener("turbolinks:load", function() {
        console.log("loading...")
        var SearchRoot = document.getElementById("searchbar");
        m.mount(SearchRoot, SearchComponent);
    })
});

var SearchResults = function() {
    var results = stream([]);
    var showResults = stream(false);
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
                    return m("div.search--result", m("a", {href: `${page.path}`}, [m("h4", page.title), m("p", page.description)] ));
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
                    m("clr-icon[shape=search]"),
                    m("input#search[name=search][type=search]", {value: query, oninput: function(e) { query = e.target.value; console.log(query) }}),
                    m("button", {class: (query.trim().length > 0 ) ? "search--clear" : 'hidden', onclick: function(e) { query = ""; document.getElementById("search").focus(); } }, m("clr-icon[shape=times]")),
                ]),
                m(SearchResults, {query: query})
            ];
        }
    }
}
document.addEventListener('DOMContentLoaded', function(){ 
}, false);

function changeEventHandler(event) {
    // You can use “this” to refer to the selected element.
    window.location.href = event.target.value
}

document.addEventListener("turbolinks:load", function() {
    console.log("loading...")
    document.querySelector('select[name="productSwitcher"]').onchange=changeEventHandler;
    // var SearchRoot = document.getElementById("searchbar");
    // m.mount(SearchRoot, SearchComponent);
})
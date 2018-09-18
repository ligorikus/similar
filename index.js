domains = require("./domains.json");
defaultURL = 'https://www.similarweb.com/website/'
current = 0;
last = domains.length-1;


queryQueue = {
  counter: 0,
  finishEvents: [],
  popEvents: [],
  push: function()
  {
    queryQueue.counter ++;
  },
  pop: function()
  {
    queryQueue.counter --;

    if( queryQueue.counter === 0)
    {
      queryQueue.fireFinish();
    }
  },
  addFinishEvent: function( func )
  {
    queryQueue.finishEvents.push( func );
    if( queryQueue.counter === 0 )
    {
      queryQueue.fireFinish();
    }
  },
  fireFinish: function()
  {
    while( func = queryQueue.finishEvents.pop() )
    {
      finishScript();
    }
  }
}
var fs=require("fs")

function startScript() {
	fs.writeFile("sites.json", "[\n")
}

function writeSite(site) {
	fs.writeFile("sites.json", JSON.stringify(site));
}

function finishScript() {
	fs.writeFile("sites.json", "]\n")
}

function scrape(url) {
	var html = document.body.innerHTML;
	traffic_response = html.match(/WeeklyTrafficNumbers":{[^}]*}/ig)[0].slice(22);
	site = {
		url: url,
		traffic: JSON.parse(traffic_response)
	}
	return site;
}

const Nightmare = require('nightmare')

function crawl(nightmare) {
	site = null;
	var id = current++;
	if(id >= last) {
		nightmare.end();
	}
	queryQueue.push();
	var siteURL = domains[id];
	var url = defaultURL + siteURL;
	nightmare
	  .goto(url)
	  .evaluate(scrape, siteURL)
	  .then(function(site) {
		  writeSite(site);
		  return crawl(nightmare);
	  })
}

//Run the nightmare window
function runCrawl() 
{
	crawl(nightmare = Nightmare({ show: true }));
}
//Run the crawling
async function run(n) 
{	
	startScript();
	for (var i = 0; i < n; i++) {
		await runCrawl();
	}
}

run(1);

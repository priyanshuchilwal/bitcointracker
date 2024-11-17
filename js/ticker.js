let btcs = new WebSocket("wss://ws.blockchain.info/inv");
let radioBTC = document.getElementById("BTC");
let radioUSD = document.getElementById("USD");
let maxDiv = document.getElementById("max");
let recent = document.getElementById("recent");
let modal = document.getElementById("transactionModal");
let close = document.getElementById("close");
let inUSD = false;
let conversion = -1;
let count = 1;
let max = 0;
let mostRecent = 0;

let getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      let status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

getJSON("https://blockchain.info/ticker",
function(err, data) {
  if (err !== null) {
    console.log('Something went wrong: ' + err);
  } else {
    conversion = data.USD.last;
  }
});

radioBTC.onclick = function() {
	if (inUSD) {
		inUSD = false;
		radioBTC.style.backgroundColor = "#218838";
		radioBTC.style.borderColor = "#1e7e34";
		radioUSD.style.backgroundColor = "#28a745";
		radioUSD.style.borderColor = "#28a745";
		maxDiv.innerHTML = `Max transaction this session: ${max}BTC`;
		recent.innerHTML = `Most recent transaction: ${mostRecent}`;
	}
}
radioUSD.onclick = function() {
	if (!inUSD) {
		inUSD = true;
		radioUSD.style.backgroundColor = "#218838";
		radioUSD.style.borderColor = "#1e7e34";
		radioBTC.style.backgroundColor = "#28a745";
		radioBTC.style.borderColor = "#28a745";
		maxDiv.innerHTML = `Max transaction this session: $${(max*conversion).toFixed(2)}`;
		recent.innerHTML = `Most recent transaction: $${(mostRecent*conversion).toFixed(2)}`;
	}
}

btcs.onopen = function() {
	btcs.send(JSON.stringify({"op":"unconfirmed_sub"}));
}

btcs.onmessage = function(msg) {
	let ticker = document.getElementById("ticker");
	const response = JSON.parse(msg.data);
	console.log(response);

	let amt = 0;
	const outs = response.x.out;

	for (let i = 0; i < outs.length; i++) {
		amt += outs[i].value;
	}

	amt = amt / 10e8;
	let rec = (inUSD)? (`$${(amt*conversion).toFixed(2)}`) : `${amt}BTC`;
	if (amt > max) {
		max = amt;
		maxDiv.innerHTML = `Max transaction this session: ${rec}`;
	}
	recent.innerHTML = `Most recent transaction: ${rec}`;
	create(amt, response);
}

close.onclick = function() {
	modal.style.display = "none";
    let ins = document.getElementById("inputVals");
	while (ins.firstChild) {
	    ins.removeChild(ins.firstChild);
	}
    let outs = document.getElementById("outputVals");
	while (outs.firstChild) {
	    outs.removeChild(outs.firstChild);
	}
}

function create(amt, response) {
	count++;
	let elem = document.createElement("p");
	const size = Math.log(amt+1.8) * 40;
	let val = (inUSD)? (`$${(amt*conversion).toFixed(2)}`) : `${amt}BTC`;
	const node = document.createTextNode(val);
	elem.appendChild(node);
	elem.onclick = function() {
		modal.style.display = "block";
		document.getElementById("hash").value = response.x.hash;
		document.getElementById("time").value = new Date(response.x.time * 1000);
		document.getElementById("size").value = `${response.x.size}B (${(response.x.size / 1024).toFixed(3)}KB)`;
		document.getElementById("txIndex").value = response.x.tx_index;
		document.getElementById("totalBTC").value = `${amt}BTC`;
		document.getElementById("totalUSD").value = `$${(amt*conversion).toFixed(2)}`;
		const ins = response.x.inputs;
		for (let i = 0; i < ins.length; i++) {
			console.log("in");
			let li = document.createElement("li");
			li.class = "list-inline-item";
			const text = document.createTextNode(`${ins[i].prev_out.value / 10e8}BTC`);
			li.appendChild(text);
			document.getElementById("inputVals").appendChild(li);
		}
		const outs = response.x.out;
		for (let i = 0; i < outs.length; i++) {
			console.log("out");
			let li = document.createElement("li");
			li.class = "list-inline-item";
			const text = document.createTextNode(`${outs[i].value / 10e8}BTC`);
			li.appendChild(text);
			document.getElementById("outputVals").appendChild(li);
		}
	}

	const red = Math.floor(Math.random() * 208);
	const blue = Math.floor(Math.random() * 208);
	const green = Math.floor(Math.random() * 208);
	let top = (Math.random() * 75) + 15;
	elem.style.fontSize = size + "px";
	elem.style.color = `rgb(${red}, ${green}, ${blue}`;
	elem.style.display = "inline-block";
	elem.style.position = "absolute";
	elem.style.top = `${top}%`;
	elem.style.right = `${window.innerWidth+10}px`;
	elem.id = count;

	let ticker = document.getElementById("ticker");
	ticker.appendChild(elem);

	travel(elem);
}

function travel(elem) {
	const w = window.innerWidth + 10;
	let per = w + 10;
	const freq = (Math.random() * 5)+3;
	let id = setInterval(frame, 20);
	let ticker = document.getElementById("ticker");
	function frame() {
		if (per <= -1*w) {	
			clearInterval(id);
			ticker.removeChild(elem);
		} else {
			per -= freq;
			elem.style.right = `${per}px`;
		}
	}
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        let ins = document.getElementById("inputVals");
		while (ins.firstChild) {
		    ins.removeChild(ins.firstChild);
		}
        let outs = document.getElementById("outputVals");
		while (outs.firstChild) {
		    outs.removeChild(outs.firstChild);
		}
    }
}

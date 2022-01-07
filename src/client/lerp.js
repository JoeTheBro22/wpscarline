function lerp(start, end, delta){
	return (1 - delta) * start + delta * end;
}

let _delta = 0;
const server_delta = 1/30;
function get_delta(delta){
	return Math.min((performance.now() - delta) / server_delta, 1);
}

//susss....
var truss = {
	joints: [],
	members: []
};

var joint = {
	adjJoints: [],
	posX: 0,
	posY: 0
};

var member = {
	force: 0,
	compression: false,
	tension: false,
	firJoint: null,
	secJoint: null
}

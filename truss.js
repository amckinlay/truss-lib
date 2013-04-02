var truss = {
	joints: [],
    addJoint: function() {
        var added = false;
        if (joints.indexOf(joint) < 0) {
            joints.push(joint);
            added = true;
        }
        return added;
    },
    // Solve all external and reaction forces
    solveEx: function() {
        // TODO
    }
};

var joint = {
	x: null,
	y: null,
    members: [], // Attached members
    forces: [], // External forces
    addMember: function(mem) {
        var added = false;
        if (members.indexOf(mem) < 0) {
            members.push(mem);
            added = true;
        }
        return added;
    }
};

var member = {
	magnitude: null, // Magnitude of internal force
	compression: null, // Boolean
	firJoint: null,
	secJoint: null,
    length: function() {
        var xDis = firJoint.x - secJoint.x;
        var yDis = firJoint.y - secJoint.y;
        return Math.sqrt(Math.pow(xDis, 2), Math.pow(yDis, 2));
    }
};

var force = {
    magnitude: null,
    angle: null,
    x: function() {
        return Math.cos(angle) * magnitude;
    },
    y: function() {
        return Math.sin(angle) * magnitude;
    }
};

// Brace is a kind of joint
var brace = Object.create(joint);
brace.type = null; // Adding type property
brace.force = null; // Adding reaction force property
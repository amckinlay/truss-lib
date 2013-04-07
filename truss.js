(function() {
    var root = this;

    var t = {};

    t.truss = {
        get joints() {
            return this._joints = this._joints || [];
        },
        addJoint: function() {
            var added = false;
            if (this.joints.indexOf(joint) < 0) {
                this.joints.push(joint);
                added = true;
            }
            return added;
        },
        // Solve all external and reaction forces
        solveEx: function() {
            // Create map: object -> matrix row index
            var matrixMap = {};
            // Need total force count for matrix formation
            var forceCount = 0;
            for (var i in this.joints) {
                for (var j in this.joints[i].members) {
                    forceCount += 1;
                }
                for (var j in this.joints[i].members) {
                    forceCount += 1;
                }
            }
            // TODO: need to complete
        }
    };

    t.joint = {
        x: null,
        y: null,
        // Attached members
        get members() {
            return this._members = this._members || [];
        },
        // External forces
        get forces() {
            return this._forces = this._forces || [];
        },
        addMember: function(mem) {
            var added = false;
            if (members.indexOf(mem) < 0) {
                members.push(mem);
                added = true;
            }
            return added;
        }
    };

    t.member = {
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

    t.force = {
        magnitude: null,
        angle: null,
        x: function() {
            return Math.cos(angle) * magnitude;
        },
        y: function() {
            return Math.sin(angle) * magnitude;
        }
    };

    // Brace is a kind of joint possessing a force
    t.brace = {};
    _.extend(t.brace, t.joint, t.force);

    root.t = t;
}).call(this);
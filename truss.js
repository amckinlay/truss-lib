// TODO: add defined method in addition/replacement to known
// TODO: determine if getters/setters are doing too much
// TODO: clean up all the error throwing
// TODO: consider using unit vectors instead of angles
// TODO: correct everything incorrectly using for-loops

(function() {
    var root = this;

    var t = {};

    t.truss = {
        get joints() {return this._joints = this._joints || [];},
        addJoint: function(joint) {
            var added = false;
            if (!t.joint.isPrototypeOf(joint)) throw "joint of truss must be joint";
            if (!_.contains(joints, joint)) {
                this.joints.push(joint);
                added = true;
            }
            return added;
        },
        known: function() {
            var known = false;
            if (uknowns.length === 0) known = true;
            return known;
        },
        knowns: function() {
            var knowns = [];
            for (var joint in this.joints) _.union(knowns, joint.knowns());
            return knowns;
        },
        unkowns: function() {
            var unknowns = [];
            for (var joint in this.joints) _.union(unknowns, joint.unknowns());
            return unknowns;
        },
        // Solve truss
        solve: function() {
            // Map: unkown member/force -> matrix column
            var columnMap = {};
            // Map: joint -> matrix row
            var rowMap = {};
            // Fill columnMap
            var columnCount = 0;
            for (var unknown in this.unknowns()) columnMap[unknown] = ++columnCount;
            // Fill rowMap
            var rowCount = 0;
            for (var joint in this.joints) rowMap[joint] = ++rowCount, rowCount++;
            // Form initial matrix with zeros
            var A = Matrix.Zero(rowCount, columnCount);
            // Form initial solution vector
            var b = Matrix.Zero(rowCount, 1);
            // Fill initial matrix and solution vector
            for (var joint in this.joints) {
                for (var unknown in joint.unknowns()) {
                    A.elements[rowMap[joint]][columnMap[unknown]] = cos(unknown.angle);
                    A.elements[rowMap[joint] + 1][columnMap[unknown]] = sin(unknown.angle);
                }
                var xKnown = 0;
                var yKnown = 0;
                for (var known in joint.knowns()) {
                        x += known.forceOn(joint).x();
                        y += known.forceOn(joint).y();
                }
                b.elements[rowMap[joint]][0] = x;
                b.elements[rowMap[joint] + 1][0] = y;
            }
            // Get magnitudes of unknowns
            columnMap = _.invert(columnMap);
            var sol = A.inv().multiply(b);
            for (var s in sol) {
                var unknown = columnMap[s];
                unknown.magnitude = sol.e(s, 1);
            }
            // TODO: divide work into smaller functions
            // TODO: use vectors instead of column matrices
        }
     };

    t.joint = {
        get x() {return x;},
        set x(val) {if (!_.isFinite(val)) throw "x-value of joint must be finite number"; x = val;},
        get y() {return y;},
        set y(val) {if (!_.isFinite(val)) throw "y-value of joint must be finite number"; y = val;},
        // Attached members
        get members() {return this._members = this._members || [];},
        // External forces
        get exForces() {return this._forces = this._forces || [];},
        addMember: function(mem) {
            var added = false;
            if (!t.member.isPrototypeOf(mem)) throw "member of joint must be member";
            if (!_.contains(this.members, mem)) {
                this.members.push(mem);
                added = true;
            }
            return added;
        },
        addExForce: function(exForce) {
            var added = false;
            if (!t.force.isPrototypeOf(exForce)) throw "exForce of joint must be force";
            if (!_.contains(this.exForces, exForce)) {
                this.exForces.push(exForce);
                added = true;
            }
            return added;
        },
        known: function() {
            var known = false;
            if (x && y) return true;
            return known;
        },
        // Collect known forces
        knowns: function() {
            return _.filter(_.union(this.members, this.exForce), function(elem) {return elem.known();});
        },
        unknowns: function() {
            return _.filter(_.union(this.members, this.exForce), function(elem) {return !elem.known();});
        }
    };

    t.member = {
        get magnitude() {return magnitude;}, // Magnitude of internal force
        set magnitude(val) {
            if (!_.isFinite(val)) throw "Magnitude of member must be finite number";
            if (val < 0) {
                magnitude = -val;
                compression = !compression;
            } else magnitude = val;
        },
        get compression() {try {return compression;} catch (e) {return false;}},
        set compression(val) {if (!_.isBoolean(val)) throw "Compression of member must be boolean"; compression = val;},
        get firJoint() {return firJoint;},
        set firJoint(val) {if (!t.joint.isPrototypeOf(val)) throw "firJoint of member must be joint"; firJoint = val;},
        get secJoint() {return secJoint;},
        set secJoint(val) {if (!t.joint.isPrototypeOf(val)) throw "secJoint of member must be joint"; secJoint = val;},
        known: function() {
            var known = false;
            if (this.magnitude) known = true;
            return known;
        },
        isAttached: function(joint) {
            var attached = false;
            if (joint === this.firJoint || joint === this.secJoint) attached = true;
            return attached;
        },
        otherJoint: function(joint) {
            var otherJoint;
            if (!this.isAttached(joint)) throw "Joint not attached to member";
            if (joint === this.firJoint) otherJoint = this.secJoint;
            else otherJoint = this.firJoint;
            return otherJoint;
        },
        length: function() {
            var xDis = this.firJoint.x - this.secJoint.x;
            var yDis = this.firJoint.y - this.secJoint.y;
            return Math.sqrt(Math.pow(xDis, 2), Math.pow(yDis, 2));
        },
        // Geometric angle from joint, does not consider internal force
        angle: function(fromJoint) {
            if (!this.isAttached(joint)) throw "Joint not attached to member";
            var xToOtherJoint = this.otherJoint(joint).x - joint.x;
            var yToOtherJoint = this.otherJoint(joint).y - joint.y;
            return Math.atan2(yToOtherJoint, xToOtherJoint);
        },
        forceOn: function(joint) {
            var force = Object.create(t.force);
            force.magnitude = this.magnitude;
            var angle = this.angle(joint);
            // Consider angle of internal force
            if (this.compression === true) force.angle = angle;
            else {
                // TODO: is there a smarter way than this? Is this necessary?
                if (angle < -Math.PI) force.angle = angle + 2 * Math.PI;
                else if (angle > Math.PI) force.angle = angle - 2 * Math.PI;
            }
            var attachedJoint = joint;
            force.forceOn = function(joint) {if (joint !== attachedJoint) throw "Force does not act on given joint"; return this;};
            return force;
        }
    };

    t.force = {
        get magnitude() {return magnitude;},
        set magnitude(val) {
            if (!_.isFinite(val)) throw "Magnitude of force must be finite number";
            if (val < 0) {
                magnitude = -val;
                angle += Math.PI;
            } else magnitude = val;
        },
        get angle() {return angle;},
        set angle(val) {
            if (!_.isFinite(val)) throw "Angle of force must be finite number";
            // TODO: is there a smarter way than this? Is this necessary?
            if (val < -Math.PI) angle = val + 2 * Math.PI;
            else if (val > Math.PI) angle = val - 2 * Math.PI;
            else angle = val;
        },
        // get joint() {return joint;},
        // set joint(val) {if (!t.joint.isPrototypeOf(val)) throw "Joint of force must be joint"; joint = val;}
        known: function() {
            var known = false;
            if (magnitude && angle) known = true;
            return known;
        },
        x: function() {
            return Math.cos(angle) * magnitude;
        },
        y: function() {
            return Math.sin(angle) * magnitude;
        },
        forceOn: function(joint) { // Quack, quack
            // TODO: enforce that force must be connected to joint to be known, added to joint, etc with joint property
            // if (joint !== this.joint) throw "Force only acts on its joint";
            if (!_.contains(joint.exForces, this)) throw "Force does not act on given joint";
            return this;
        }
    };

    // Brace is a kind of force
    t.brace = Object.create(t.force);

    root.t = t;
}).call(this);
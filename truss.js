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
            // Map: unkown force/brace -> matrix column
            var columnMap = {};
            // Map: joint/brace -> matrix row
            var rowMap = {};
            // Fill columnMap
            var columnCount = 0;
            for (var unknown in this.unknowns()) columnMap[unknown] = columnCount++;
            // Fill rowMap
            var rowCount = 0;
            for (var joint in this.joints) rowMap[joint] = rowCount++;
            // Form initial matrix with zeros
            var A = [];
            var zeros = [];
            for (var i = 0; i < columnCount; ++i) zeros.push(0);
            for (var i = 0; i < rowCount; ++i) A.push(_.clone(zeros));
            // Form initial solution vector
            var b = [];
            for (var i = 0; i < rowCount; ++i) b.push(0);
            // Fill initial matrix
            for (var joint in rowMap) {
                for (var unknown in joint.unknowns()) {
                    var x = 0;
                    var y = 0;
                    if (t.member.isPrototypeOf(unknown)) {
                        x = unknown.xDirTo(joint);
                        y = unknown.yDirTo(joint);
                    } else {
                        x = Math.cos(unknown.angle);
                        y = Math.sin(unknown.angle);
                    }
                    A[rowMap[joint] * 2][columnMap[unknown]] = x;
                    A[rowMap[joint] * 2 + 1][columnMap[unknown]] = y;
                }
                var x = 0;
                var y = 0;
                for (var known in joint.knowns()) {
                    if (t.member.isPrototypeOf(known)) {
                        x += known.xForceOn(joint);
                        y += known.yForceOn(joint);
                    } else {
                        x += known.x();
                        y += known.y();
                    }
                }
                b[rowMap[joint] * 2] = x;
                b[rowMap[joint] * 2 + 1] = y;
            }
            // Form matrix
            var A = $M(A);
            // Form solution vector
            var b = $V(b);
            // Get magnitudes of unknowns
            var sol = A.inv().multiply(b);
            for (var s in sol) {
                var unknown = unknowns[s];
                if (t.force.isPrototypeOf(unknown) || t.brace.isPrototypeOf(unknown)) {
                    unknown.magnitude = sol[s];
                } else {
                    if (sol[s] >= 0) {
                        unknown.compression = true;
                    }
                    else {
                        unknown.tension = false;
                    }
                    unknown.magnitude = sol[s];
                }
            }
            // TODO: use Sylvester from beginning of function (can use Sylvester to fill zeros)
            // TODO: divide work into smaller functions
            // TODO: implement system to force positive magnitudes for forces/braces
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
            var knowns = [];
            for (var mem in this.members) {
                var mem = this.members[mem];
                if (mem.known()) knowns.push(mem);
            }
            for (var exF in this.exForces) {
                var exF = this.exForces[exF];
                if (exF.known()) knowns.push(exF);
            }
            // Forward consideration for subtype brace
            if (t.brace.isPrototypeOf(this)) if (this.known()) knowns.push(this);
            return knowns;
        },
        unknowns: function() {
            var unknowns = [];
            for (var mem in this.members) {
                var mem = this.members[mem];
                if (!mem.known()) unknowns.push(mem);
            }
            for (var exF in this.exForces) {
                var exF = this.exForces[exF];
                if (!exF.known()) unknowns.push(exF);
            }
            // Forward consideration for subtype brace
            if (t.brace.isPrototypeOf(this)) if (this.known()) knowns.push(this);
            return knowns;
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
        get compression() {return compression;},
        set compression(val) {if (!_.isBoolean(val)) throw "Compression of member must be boolean"; compression = val;},
        get firJoint() {return firJoint;},
        set firJoint(val) {if (!t.joint.isPrototypeOf(val)) throw "firJoint of member must be joint"; firJoint = val;},
        get secJoint() {return secJoint;},
        set secJoint(val) {if (!t.joint.isPrototypeOf(val)) throw "secJoint of member must be joint"; secJoint = val;},
        known: function() {
            var known = false;
            if (this.magnitude && this.comnpression !== null) known = true;
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
        forceOn: function(joint) {
            if (!this.isAttached(joint)) throw "Joint not attached to member";
            var force = Object.create(t.force);
            force.magnitude = this.magnitude;
            var yDisplacement = joint.y - this.otherJoint(joint).y;
            var xDisplacement = joint.x - this.otherJoint(joint).x;
            force.angle = Math.atan2(yDisplacement, xDisplacement);
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
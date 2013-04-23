// TODO: add defined method in addition/replacement to known
// TODO: determine if getters/setters are doing too much
// TODO: clean up all the error throwing (e.g., should addMember be checking if member is already added?)
// TODO: consider using unit vectors instead of angles
// TODO: correct everything incorrectly using for-loops
// Question: should calling code check conditions, or should library check conditions and throw errors?\\
// Should there be an addMember function for truss?
// Should there be an addJoint function for member?
// TODO: consider chaining
// TODO: performance sucks, since javascript object does not support objects for keys
// TODO: consider adding CAS

(function() {
    var root = this;

    var t = {};

    t.truss = {
        get joints() {return this._joints = this._joints || [];},
        addJoint: function(joint) {
            var added = false;
            if (!t.joint.isPrototypeOf(joint)) throw "joint of truss must be joint";
            if (!_.contains(this.joints, joint)) {
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
            return _.reduce(
                this.joints,
                function(memo, joint) {
                    return _.union(memo, joint.knowns());
                },
                []
            );
        },
        unknowns: function() {
            return _.reduce(
                this.joints,
                function(memo, joint) {
                    return _.union(memo, joint.unknowns());
                },
                []
            );
        },
        // Solve truss
        solve: function() {
            var columnMap = {}; // Map: matrix column -> unknown member/force
            var rowMap = {}; // Map: matrix row -> joint
            // Fill columnMap
            var columnCount = 0;
            _.each(this.unknowns(), function(unknown) {columnMap[++columnCount] = unknown;});
            // Fill rowMap
            var rowCount = 0;
            _.each(this.joints, function(joint) {rowMap[++rowCount, rowCount++] = joint;});
            var A = Matrix.Zero(rowCount, columnCount); // Form initial matrix
            var b = Vector.Zero(rowCount); // Form initial solution vector
            // Fill A and b
            _.each(rowMap, function(joint, row) {
                row = row - 1; // Math indices to array indices
                _.each(columnMap, function(unknown, column) { // Fill A with unknows
                    column = column - 1; // Math indices to array indices
                    if (_.contains(joint.unknowns(), unknown)) {
                        //console.log(unknown.angle);
                        A.elements[row][column] = Math.cos(unknown.getAngle(joint)); // x
                        A.elements[row + 1][column] = Math.sin(unknown.getAngle(joint)); // y
                    }
                });
                _.each(joint.knowns(), function(known) { // Fill b with knowns
                    b.elements[row] += -known.forceOn(joint).x(); // x
                    b.elements[row + 1] += -known.forceOn(joint).y(); // y
                });
            });
            console.log(A.elements);
            console.log(b.elements);
            // Solve for magnitudes of unknowns
            var sol = A.inv().multiply(b);
            sol.each(function(mag, index) {
                columnMap[index].magnitude = mag;
            });
            console.log(sol.elements);
        }
     };

    t.joint = {
        get x() {return this._x;},
        set x(val) {if (!_.isFinite(val)) throw "x-value of joint must be finite number"; this._x = val;},
        get y() {return this._y;},
        set y(val) {if (!_.isFinite(val)) throw "y-value of joint must be finite number"; this._y = val;},
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
        // Should be "defined" not known
        known: function() {
            var known = true;
            if (this.x === undefined || this.y === undefined) known = false;
            return known;
        },
        // Collect known forces
        knowns: function() {
            return _.filter(
                _.union(this.members, this.exForces),
                function(elem) {return elem.known();}
            );
        },
        unknowns: function() {
            return _.filter(
                _.union(this.members, this.exForces),
                function(elem) {return !elem.known();}
            );
        }
    };

    t.member = {
        get magnitude() {return this._magnitude;}, // Magnitude of internal force
        set magnitude(val) {
            if (!_.isFinite(val)) throw "Magnitude of member must be finite number";
            if (val < 0) {
                this._magnitude = -val;
                this.compression = !this.compression;
            } else this._magnitude = val;
        },
        // Members in tension by default
        get compression() {if (this._compression === undefined) return false; else return this._compression},
        set compression(val) {
            if (!_.isBoolean(val)) throw "Compression of member must be boolean";
            if (this.magnitude === undefined) {throw "Set magnitude before compression";}
            this._compression = val;
        },
        get firJoint() {return this._firJoint;},
        set firJoint(val) {if (!t.joint.isPrototypeOf(val)) throw "firJoint of member must be joint"; this._firJoint = val;},
        get secJoint() {return this._secJoint;},
        set secJoint(val) {if (!t.joint.isPrototypeOf(val)) throw "secJoint of member must be joint"; this._secJoint = val;},
        known: function() {
            var known = true;
            if (this.magnitude === undefined) known = false;
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
        getAngle: function(fromJoint) {
            if (!this.isAttached(fromJoint)) throw "Joint not attached to member";
            var xToOtherJoint = this.otherJoint(fromJoint).x - fromJoint.x;
            var yToOtherJoint = this.otherJoint(fromJoint).y - fromJoint.y;
            return Math.atan2(yToOtherJoint, xToOtherJoint);
        },
        forceOn: function(joint) {
            var force = Object.create(t.force);
            force.magnitude = this.magnitude;
            var angle = this.getAngle(joint);
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
        get magnitude() {return this._magnitude;},
        set magnitude(val) {
            if (!_.isFinite(val)) throw "Magnitude of force must be finite number";
            if (val < 0) {
                this._magnitude = -val;
                angle += Math.PI;
            } else this._magnitude = val;
        },
        get angle() {return this._angle;},
        set angle(val) {
            if (!_.isFinite(val)) throw "Angle of force must be finite number";
            // TODO: is there a smarter way than this? Is this necessary?
            if (val < -Math.PI) this._angle = val + 2 * Math.PI;
            else if (val > Math.PI) this._angle = val - 2 * Math.PI;
            else this._angle = val;
        },
        getAngle: function() { // Quack, quack
            return this.angle;
        },
        // get joint() {return joint;},
        // set joint(val) {if (!t.joint.isPrototypeOf(val)) throw "Joint of force must be joint"; joint = val;}
        known: function() {
            var known = true;
            if (this.magnitude === undefined || this.angle === undefined) known = false;
            return known;
        },
        x: function() {
            return Math.cos(this.angle) * this.magnitude;
        },
        y: function() {
            return Math.sin(this.angle) * this.magnitude;
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
(function() {
	var joint1 = Object.create(t.joint);
	var joint2 = Object.create(t.joint);
	joint1.x = 7;
	joint1.y = -3;
	joint2.x = -2;
	joint2.y = -1;
	var mem = Object.create(t.member);
	mem.magnitude = 3;
	mem.firJoint = joint1;
	mem.secJoint = joint2;
	console.log(mem.forceOn(joint1));
	console.log(mem.known());
})();
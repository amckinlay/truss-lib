(function() {
	var joint1 = Object.create(t.joint);
	var joint2 = Object.create(t.joint);
	var joint3 = Object.create(t.joint);
	joint1.x = 7;
	joint1.y = -3;
	joint2.x = -2;
	joint2.y = -3;
	joint3.x = 4;
	joint3.y = 1;
	var mem1 = Object.create(t.member);
	var mem2 = Object.create(t.member);
	var mem3 = Object.create(t.member);
	mem1.firJoint = joint1;
	mem1.secJoint = joint2;
	mem2.firJoint = joint2;
	mem2.secJoint = joint3;
	mem3.firJoint = joint3;
	mem3.secJoint = joint1;
	joint1.addMember(mem1);
	joint1.addMember(mem3);
	joint2.addMember(mem1);
	joint2.addMember(mem2);
	joint3.addMember(mem2);
	joint3.addMember(mem3);
	var force1 = Object.create(t.force);
	force1.magnitude = 2;
	force1.angle = -Math.PI / 2;
	joint3.addExForce(force1);
	var brace1 = Object.create(t.brace);
	brace1.angle = Math.PI / 2;
	joint2.addExForce(brace1);
	var brace2 = Object.create(t.brace);
	brace2.angle = 0;
	joint2.addExForce(brace2);
	var brace3 = Object.create(t.brace);
	brace3.angle = Math.PI / 2;
	joint1.addExForce(brace3);
	var truss = Object.create(t.truss);
	truss.addJoint(joint1);
	truss.addJoint(joint2);
	truss.addJoint(joint3);
	truss.solve();
	console.log(mem1.magnitude);
	console.log(mem2.magnitude);
	console.log(mem3.magnitude);
	console.log(mem1.compression);
	console.log(mem2.compression);
	console.log(mem3.compression);
	console.log(brace1.x());
	console.log(brace1.y());
	console.log(brace2.x());
	console.log(brace2.y());
	console.log(brace3.x());
	console.log(brace3.y());
	//console.log(brace2.compression);
	//console.log(brace3.compression);
})();
// TODO: consider making braces just forces
// TODO: consider being able to solve for force magnitudes AND angles
// TODO: consider making a force's angle be a unit Stylvester vector instead
// TODO: solve truss with list of force?
// TODO: solve truss with list of unknowns?

(function() {
	// Forming truss below
	var joint1 = Object.create(t.joint);
	var joint2 = Object.create(t.joint);
	var joint3 = Object.create(t.joint);
	// Positions of joints in space
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
	// Adding a load and bracing forces
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
	
	// Three unknown members
	console.log("Member 1 known?", mem1.known());
	console.log("Member 2 known?", mem2.known());
	console.log("Member 3 known?", mem3.known());
	
	// Solve, NOTE: truss library is also logging matrix, known vector, and solution vector!
	console.log("Solving truss")
	truss.solve();
	
	// Tree unknown members now known
	console.log("Member 1 known?", mem1.known());
	console.log("Member 2 known?", mem2.known());
	console.log("Member 3 known?", mem3.known());
	
	// We can not get their magnitudes and compression/tension bool
	console.log("What is the magnitude of the inernal force in member 1?", mem1.magnitude);
	console.log("What is the magnitude of the inernal force in member 2?", mem2.magnitude);
	console.log("What is the magnitude of the inernal force in member 3?", mem3.magnitude);
	console.log("Is member 1 in compression?", mem1.compression);
	console.log("Is member 2 in compression?", mem2.compression);
	console.log("Is member 3 in compression?", mem3.compression);
	
	// Also, the bracing forces are now known
	console.log("What is brace 1's x-component force?", brace1.x());
	console.log("What is brace 1's y-component force?", brace1.y());
	console.log("What is brace 2's x-component force?", brace2.x());
	console.log("What is brace 2's y-component force?", brace2.y());
	console.log("What is brace 3's x-component force?", brace3.x());
	console.log("What is brace 3's y-component force?", brace3.y());
})();

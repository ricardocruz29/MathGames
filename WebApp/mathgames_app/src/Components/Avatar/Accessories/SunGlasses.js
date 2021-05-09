/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
author: person-x (https://sketchfab.com/person-x)
license: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
source: https://sketchfab.com/models/5c78f100eea749c895d69fe2ed728197
title: Glasses
*/

import { React, useRef } from "react";
import { useGLTF } from "@react-three/drei";


function SunGlasses(props) {
	const group = useRef();
	const { nodes, materials } = useGLTF(process.env.PUBLIC_URL + 'avatar_assets/accessories/sunGlasses.glb')
  
	return (
		<group ref={group} {...props} dispose={null}>
			<group rotation={[-Math.PI / 2, 0, 0]}>
				<group rotation={[Math.PI / 2, 0, 0]}>
					<group rotation={[0, 0, 0]} position={[0, 1.59, 0.7]} scale={[0.04, 0.04, 0.03]} >
						<mesh geometry={nodes.Glasses_Glasses2_0.geometry} material={materials.Glasses2} />
						<mesh geometry={nodes.Glasses_Lenses_0.geometry} material={materials.Lenses} />
						<mesh geometry={nodes.Glasses_Glasses1_0.geometry} material={materials.Glasses1} />
					</group>
				</group>
			</group>
		</group>
	)
}

export default SunGlasses;
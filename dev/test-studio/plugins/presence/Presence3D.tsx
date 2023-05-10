/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-unknown-property */
// Fork of https://codesandbox.io/s/object-clump-ssbdsw

import React, {memo, useState} from 'react'

import {Physics, useCylinder, useSphere} from '@react-three/cannon'
import {Effects as EffectComposer, Environment, Sky, useTexture} from '@react-three/drei'
import {Canvas, extend, useFrame, useThree} from '@react-three/fiber'
import * as THREE from 'three'
import {SSAOPass} from 'three-stdlib'
import {
  LanguageLoader,
  TranslationLoader,
  useGlobalPresence,
  useTranslation,
  useUserColor,
  useWorkspace,
} from 'sanity'
import styled from 'styled-components'
import {Card, Box, Text} from '@sanity/ui'
import {en, no} from './i18n'

extend({SSAOPass})

const rfs = THREE.MathUtils.randFloatSpread
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const baubleMaterial = new THREE.MeshStandardMaterial({
  color: 'red',
  roughness: 0,
  envMapIntensity: 0.2,
  emissive: '#370037',
})

export const initial = {
  count: 40,
  color: 'red',
  roughness: 0,
  emissive: '#370037',
}

function Clump({
  mat = new THREE.Matrix4(),
  vec = new THREE.Vector3(),
  count,
  extra,
  ...props
}: any) {
  const texture = useTexture('/static/cross.jpeg')
  const [ref, api] = useSphere(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)],
  }))
  useFrame((state) => {
    for (let i = 0; i < count; i++) {
      // Get current whereabouts of the instanced sphere
      ;(ref.current as any).getMatrixAt(i, mat)
      // Normalize the position and multiply by a negative force.
      // This is enough to drive it towards the center-point.
      api
        .at(i)
        .applyForce(
          vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-50).toArray(),
          [0, 0, 0]
        )
    }
  })
  return (
    <instancedMesh
      ref={ref as any}
      castShadow
      receiveShadow
      args={[null, null, count] as any}
      geometry={sphereGeometry}
      material={baubleMaterial}
      material-map={texture}
    />
  )
}

function UserClump({
  mat = new THREE.Matrix4(),
  vec = new THREE.Vector3(),
  imageUrl,
  userId,
  i: start,
  ...props
}: any) {
  const color = useUserColor(userId)
  const [sphereGeometry] = useState(() => new THREE.CylinderGeometry(1.25, 1.25, 0.1, 64))
  const [baubleMaterial] = useState(
    () =>
      new THREE.MeshStandardMaterial({
        // color: presence?.color?.border,
        color: color?.border,
        roughness: 0,
        envMapIntensity: 0.2,
        // emissive: presence?.color?.text,
        emissive: color?.text,
      })
  )

  // TODO: error recovery if image fails  to load
  const texture = useTexture(imageUrl)

  const [ref, api] = useCylinder(() => ({
    args: [1],
    mass: 1,
    angularDamping: 0.1,
    linearDamping: 0.65,
    position: [rfs(20), rfs(20), rfs(20)],
  }))
  useFrame((state) => {
    // Get current whereabouts of the instanced sphere
    ;(ref.current as any).getMatrixAt(0, mat)
    // Normalize the position and multiply by a negative force.
    // This is enough to drive it towards the center-point.
    api
      .at(0)
      .applyForce(
        vec.setFromMatrixPosition(mat).normalize().multiplyScalar(-50).toArray(),
        [0, 0, 0]
      )
  })
  return (
    <instancedMesh
      ref={ref as any}
      castShadow
      receiveShadow
      args={[null, null, 1] as any}
      geometry={sphereGeometry}
      material={baubleMaterial}
      material-map={texture}
    />
  )
}

function Pointer() {
  const viewport = useThree((state) => state.viewport)
  const [, api] = useSphere(() => ({type: 'Kinematic', args: [3], position: [0, 0, 0]}))
  return useFrame((state) =>
    api.position.set((state.mouse.x * viewport.width) / 2, (state.mouse.y * viewport.height) / 2, 0)
  )
}

function Effects(props: any) {
  const {scene, camera} = useThree()
  return (
    <EffectComposer {...props}>
      {/* @ts-expect-error -- @types/react doesn't know about this JSX Element */}
      <sSAOPass args={[scene, camera, 100, 100]} kernelRadius={1.2} kernelSize={0} />
    </EffectComposer>
  )
}

const Container = styled(Box)`
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`
const Frame = styled(Card)`
  height: 640px;
  width: 640px;
  max-height: 100%;
  max-width: 100%;
`

const languageLoader: LanguageLoader = async (language) => {
  return [{namespace: 'presence3d', resources: language === 'no' ? no : en}]
}

export default memo(function Presence3D() {
  const globalPresence = useGlobalPresence()
  const {currentUser} = useWorkspace()
  const count = globalPresence?.length + 3
  const {t} = useTranslation('presence3d')
  return (
    <Container sizing="border" display="flex">
      <Box padding={4}>
        <TranslationLoader languageLoader={languageLoader}>
          <Text>{t('moreFun')}</Text>
        </TranslationLoader>
      </Box>
    </Container>
  )
})

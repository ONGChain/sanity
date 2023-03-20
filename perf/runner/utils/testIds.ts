type TestId<T extends string> = T & {__brand: 'test-id'}

const VALID_ID = /^[a-z0-9_-]+$/

function isValidSanityId(id: string) {
  return VALID_ID.test(id)
}

function defineId<T extends string>(testId: T) {
  if (!isValidSanityId(testId)) {
    throw new Error(
      `"${testId}" is not a valid test ID. A test ID must be all lowercase and a valid Sanity document ID`
    )
  }

  return testId as TestId<T>
}

type KnownTestId =
  | 'simple-typing-speed-test'
  | 'deeply-nested-objects-test'
  | 'array-of-1k-items'
  | 'array-of-200-items'
  | 'large-array-editing-other-field'

export const KNOWN_TEST_IDS: {[P in KnownTestId]: TestId<P>} = {
  'simple-typing-speed-test': defineId('simple-typing-speed-test'),
  'deeply-nested-objects-test': defineId('deeply-nested-objects-test'),
  'array-of-1k-items': defineId('array-of-1k-items'),
  'array-of-200-items': defineId('array-of-200-items'),
  'large-array-editing-other-field': defineId('large-array-editing-other-field'),
}

export type ValidTestId = (typeof KNOWN_TEST_IDS)[keyof typeof KNOWN_TEST_IDS]

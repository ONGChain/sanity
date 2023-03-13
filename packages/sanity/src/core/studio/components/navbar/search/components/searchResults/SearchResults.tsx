import {Card, Flex} from '@sanity/ui'
import React, {useCallback, useMemo} from 'react'
import styled from 'styled-components'
import {
  CommandList,
  CommandListVirtualItemProps,
  CommandListVirtualItemValue,
} from '../../../../../../components'
import {WeightedHit} from '../../../../../../search'
import {getPublishedId} from '../../../../../../util/draftUtils'
import {useSearchState} from '../../contexts/search/useSearchState'
import {NoResults} from '../NoResults'
import {SearchError} from '../SearchError'
import {SortMenu} from '../SortMenu'
import {DebugOverlay} from './item/DebugOverlay'
import {SearchResultItem} from './item/SearchResultItem'

const VIRTUAL_LIST_SEARCH_RESULT_ITEM_HEIGHT = 59 // px
const VIRTUAL_LIST_OVERSCAN = 4

const SearchResultsInnerFlex = styled(Flex)<{$loading: boolean}>`
  opacity: ${({$loading}) => ($loading ? 0.5 : 1)};
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  transition: 300ms opacity;
  width: 100%;
`

interface SearchResultsProps {
  inputElement: HTMLInputElement | null
}

export function SearchResults({inputElement}: SearchResultsProps) {
  const {
    dispatch,
    onClose,
    recentSearchesStore,
    setSearchCommandList,
    state: {debug, filters, fullscreen, lastActiveIndex, result, terms},
  } = useSearchState()

  const hasSearchResults = !!result.hits.length
  const hasNoSearchResults = !result.hits.length && result.loaded
  const hasError = result.error

  const values: CommandListVirtualItemValue<WeightedHit>[] = useMemo(() => {
    return result.hits.map((i) => ({value: i}))
  }, [result.hits])

  /**
   * Add current search to recent searches, trigger child item click and close search
   */
  const handleSearchResultClick = useCallback(() => {
    if (recentSearchesStore) {
      const updatedRecentSearches = recentSearchesStore.addSearch(terms, filters)
      dispatch({recentSearches: updatedRecentSearches, type: 'RECENT_SEARCHES_SET'})
    }
    onClose?.()
  }, [dispatch, filters, onClose, recentSearchesStore, terms])

  const renderItem = useCallback(
    ({value}: CommandListVirtualItemProps<WeightedHit>) => {
      return (
        <>
          <SearchResultItem
            documentId={getPublishedId(value.hit._id) || ''}
            documentType={value.hit._type}
            onClick={handleSearchResultClick}
            paddingTop={2}
            paddingX={2}
          />
          {debug && <DebugOverlay data={value} />}
        </>
      )
    },
    [debug, handleSearchResultClick]
  )

  return (
    <Flex>
      <Card
        borderTop={fullscreen || !!(hasError || hasSearchResults || hasNoSearchResults)}
        flex={1}
      >
        <Flex direction="column" height="fill">
          {/* Sort menu */}
          {hasSearchResults && <SortMenu />}

          {/* Results */}
          <SearchResultsInnerFlex $loading={result.loading} aria-busy={result.loading} flex={1}>
            {hasError ? (
              <SearchError />
            ) : (
              <>
                {hasSearchResults && (
                  <CommandList
                    activeItemDataAttr="data-hovered"
                    ariaLabel="Search results"
                    autoFocus
                    fixedHeight
                    inputElement={inputElement}
                    initialIndex={lastActiveIndex}
                    itemHeight={VIRTUAL_LIST_SEARCH_RESULT_ITEM_HEIGHT}
                    overscan={VIRTUAL_LIST_OVERSCAN}
                    paddingBottom={2}
                    renderItem={renderItem}
                    ref={setSearchCommandList}
                    values={values}
                  />
                )}
                {hasNoSearchResults && <NoResults />}
              </>
            )}
          </SearchResultsInnerFlex>
        </Flex>
      </Card>
    </Flex>
  )
}

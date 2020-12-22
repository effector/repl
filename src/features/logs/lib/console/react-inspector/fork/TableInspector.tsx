/**
 * Specs:
 * https://developer.chrome.com/devtools/docs/commandline-api#tabledata-columns
 * https://developer.mozilla.org/en-US/docs/Web/API/Console/table
 */

import React from 'react'
import {styled} from 'linaria/react'

import {ObjectValue} from './ObjectInspector'
import {styleSet} from '../styles'

const styles = styleSet.TableInspector

export class TableInspector extends React.Component<
  {
    /**
     * the Javascript object you would like to inspect, either an array or an object
     */
    data: any
    /**
     * An array of the names of the columns you'd like to display in the table
     */
    columns?: string[]
  },
  {
    sorted: boolean
    sortIndexColumn: boolean
    sortColumn?: string
    sortAscending: boolean
  }
> {
  state = {
    sorted: false, // has user ever clicked the <th> tag to sort?
    sortIndexColumn: false, // is index column sorted?
    sortColumn: undefined, // which column is sorted?
    sortAscending: false, // is sorting ascending or descending?
  }

  handleIndexTHClick() {
    this.setState(({sortIndexColumn, sortAscending}) => ({
      sorted: true,
      sortIndexColumn: true,
      sortColumn: undefined,
      // when changed to a new column, default to asending
      sortAscending: sortIndexColumn ? !sortAscending : true,
    }))
  }

  handleTHClick(col) {
    this.setState(({sortColumn, sortAscending}) => ({
      sorted: true,
      sortIndexColumn: false,
      // update sort column
      sortColumn: col,
      // when changed to a new column, default to asending
      sortAscending: col === sortColumn ? !sortAscending : true,
    }))
  }

  render() {
    const data = this.props.data
    const columns = this.props.columns

    if (typeof data !== 'object' || data === null) {
      return <div />
    }

    let {rowHeaders, colHeaders} = getHeaders(data)

    // columns to be displayed are specified
    // NOTE: there's some space for optimization here
    if (columns !== undefined) {
      colHeaders = columns
    }

    let rowsData = rowHeaders.map(rowHeader => data[rowHeader])

    const sortIndexColumn = this.state.sortIndexColumn,
      sortColumn = this.state.sortColumn,
      sortAscending = this.state.sortAscending

    let columnDataWithRowIndexes /* row indexes are [0..nRows-1] */
    // TODO: refactor
    if (sortColumn !== undefined) {
      // the column to be sorted (rowsData, column) => [[columnData, rowIndex]]
      columnDataWithRowIndexes = rowsData.map((rowData, index) => {
        // normalize rowData
        if (
          typeof rowData === 'object' &&
          rowData !== null /*&& rowData.hasOwnProperty(sortColumn)*/
        ) {
          const columnData = rowData[sortColumn!]
          return [columnData, index]
        }
        return [undefined, index]
      })
    } else {
      if (sortIndexColumn) {
        columnDataWithRowIndexes = rowHeaders.map((rowData, index) => {
          const columnData = rowHeaders[index]
          return [columnData, index]
        })
      }
    }
    if (columnDataWithRowIndexes !== undefined) {
      // apply a mapper before sorting (because we need to access inside a container)
      const comparator = (mapper, ascending) => {
        return (a, b) => {
          const v1 = mapper(a) // the datum
          const v2 = mapper(b)
          const type1 = typeof v1
          const type2 = typeof v2
          // use '<' operator to compare same type of values or compare type precedence order #
          const lt = (v1, v2) => {
            if (v1 < v2) {
              return -1
            } else if (v1 > v2) {
              return 1
            } else {
              return 0
            }
          }
          let result
          if (type1 === type2) {
            result = lt(v1, v2)
          } else {
            // order of different types
            const order = {
              string: 0,
              number: 1,
              object: 2,
              symbol: 3,
              boolean: 4,
              undefined: 5,
              function: 6,
            }
            result = lt(order[type1], order[type2])
          }
          // reverse result if descending
          if (!ascending) result = -result
          return result
        }
      }
      const sortedRowIndexes = columnDataWithRowIndexes
        .sort(comparator(item => item[0], sortAscending))
        .map(item => item[1]) // sorted row indexes
      rowHeaders = sortedRowIndexes.map(i => rowHeaders[i])
      rowsData = sortedRowIndexes.map(i => rowsData[i])
    }

    return (
      <div style={styles.base}>
        <HeaderContainer
          columns={colHeaders}
          /* for sorting */
          sorted={this.state.sorted}
          sortIndexColumn={this.state.sortIndexColumn}
          sortColumn={this.state.sortColumn}
          sortAscending={this.state.sortAscending}
          onTHClick={this.handleTHClick.bind(this)}
          onIndexTHClick={this.handleIndexTHClick.bind(this)}
        />
        <DataContainer
          rows={rowHeaders}
          columns={colHeaders}
          rowsData={rowsData}
        />
      </div>
    )
  }
}

function getHeaders(data) {
  let rowHeaders
  // is an array
  if (Array.isArray(data)) {
    const nRows = data.length
    rowHeaders = [...Array(nRows).keys()]
  } else if (data !== null) {
    // is an object
    // keys are row indexes
    rowHeaders = Object.keys(data)
  }

  // Time: O(nRows * nCols)
  const colHeaders = rowHeaders.reduce((colHeaders, rowHeader) => {
    const row = data[rowHeader]
    if (typeof row === 'object' && row !== null) {
      /* O(nCols) Could optimize `includes` here */
      const cols = Object.keys(row)
      cols.reduce((xs, x) => {
        if (!xs.includes(x)) {
          /* xs is the colHeaders to be filled by searching the row's indexes */
          xs.push(x)
        }
        return xs
      }, colHeaders)
    }
    return colHeaders
  }, [])
  return {
    rowHeaders: rowHeaders,
    colHeaders: colHeaders,
  }
}

const dataContStyles = styleSet.TableInspectorDataContainer
const borderStyles = styleSet.TableInspectorLeftBorder

const tdStyles = {
  none: {...dataContStyles.td, ...borderStyles.none},
  solid: {...dataContStyles.td, ...borderStyles.solid},
}

const DataContainer = ({rows, columns, rowsData}) => {
  return (
    <div style={dataContStyles.div}>
      <table style={dataContStyles.table}>
        <colgroup />
        <tbody>
          {rows.map((row, i) => (
            <tr key={row} style={dataContStyles.tr}>
              <td style={tdStyles.none}>{row}</td>

              {columns.map(column => {
                const rowData = rowsData[i]
                // rowData could be
                //  object -> index by key
                //    array -> index by array index
                //    null -> pass
                //  boolean -> pass
                //  string -> pass (hasOwnProperty returns true for [0..len-1])
                //  number -> pass
                //  function -> pass
                //  symbol
                //  undefined -> pass
                if (
                  typeof rowData === 'object' &&
                  rowData !== null &&
                  rowData.hasOwnProperty(column)
                ) {
                  return (
                    <td key={column} style={tdStyles.solid}>
                      <ObjectValue object={rowData[column]} />
                    </td>
                  )
                } else {
                  return <td key={column} style={tdStyles.solid} />
                }
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const thStyles = {
  solid: {
    default: {
      ...styleSet.TableInspectorTH.base,
      ...styleSet.TableInspectorLeftBorder.solid,
    },
    hovered: {
      ...styleSet.TableInspectorTH.base,
      ...styleSet.TableInspectorLeftBorder.solid,
      ...styleSet.TableInspectorTH.base[':hover'],
    },
  },
  none: {
    default: {
      ...styleSet.TableInspectorTH.base,
      ...styleSet.TableInspectorLeftBorder.none,
    },
    hovered: {
      ...styleSet.TableInspectorTH.base,
      ...styleSet.TableInspectorLeftBorder.none,
      ...styleSet.TableInspectorTH.base[':hover'],
    },
  },
}

const SortIconContainer = styled.div`
  position: absolute;
  top: 1px;
  right: 0px;
  bottom: 1px;
  display: flex;
  align-items: center;
`

class TH extends React.Component<{
  borderStyle: 'none' | 'solid'
  sorted?: boolean
  sortAscending: boolean
  onClick?: React.MouseEventHandler<HTMLTableHeaderCellElement>
}> {
  state = {hovered: false}

  render() {
    // either not sorted, sort ascending or sort descending
    const {
      borderStyle,
      children,
      onClick,
      sortAscending = false,
      sorted = false,
    } = this.props
    return (
      <th
        style={
          thStyles[borderStyle][this.state.hovered ? 'hovered' : 'default']
        }
        onMouseEnter={() => this.setState({hovered: true})}
        onMouseLeave={() => this.setState({hovered: false})}
        onClick={onClick}>
        <div style={styleSet.TableInspectorTH.div}>{children}</div>
        {sorted && (
          <SortIconContainer>
            <div style={styleSet.TableInspectorSortIcon}>
              {sortAscending ? '▲' : '▼'}
            </div>
          </SortIconContainer>
        )}
      </th>
    )
  }
}

const HeaderContainer = ({
  indexColumnText = '(index)',
  columns = [] as string[],
  sorted,
  sortIndexColumn,
  sortColumn,
  sortAscending,
  onTHClick,
  onIndexTHClick,
}) => {
  const styles = styleSet.TableInspectorHeaderContainer
  return (
    <div style={styles.base}>
      <table style={styles.table}>
        <tbody>
          <tr>
            <TH
              borderStyle="none"
              sorted={sorted && sortIndexColumn}
              sortAscending={sortAscending}
              onClick={onIndexTHClick}>
              {indexColumnText}
            </TH>
            {columns.map(column => (
              <TH
                borderStyle="solid"
                key={column}
                sorted={sorted && sortColumn === column}
                sortAscending={sortAscending}
                onClick={e => onTHClick(column, e)}>
                {column}
              </TH>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

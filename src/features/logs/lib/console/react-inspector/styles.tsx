import React from 'react'
import {css} from 'linaria'
import {theme} from '../theme'

const {styles} = theme

const unselectable = {
  WebkitTouchCallout: 'none',
  WebkitUserSelect: 'none',
  KhtmlUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
  OUserSelect: 'none',
  userSelect: 'none',
}

export const styleSet = {
  DOMNodePreview: {
    htmlOpenTag: {
      base: {
        color: styles.HTML_TAG_COLOR,
      } as React.CSSProperties,
      tagName: {
        color: styles.HTML_TAGNAME_COLOR,
        textTransform: styles.HTML_TAGNAME_TEXT_TRANSFORM,
      } as React.CSSProperties,
      htmlAttributeName: {
        color: styles.HTML_ATTRIBUTE_NAME_COLOR,
      } as React.CSSProperties,
      htmlAttributeValue: {
        color: styles.HTML_ATTRIBUTE_VALUE_COLOR,
      } as React.CSSProperties,
    },
    htmlCloseTag: {
      base: {
        color: styles.HTML_TAG_COLOR,
      } as React.CSSProperties,
      offsetLeft: {
        /* hack: offset placeholder */
        marginLeft: -styles.TREENODE_PADDING_LEFT,
      } as React.CSSProperties,
      tagName: {
        color: styles.HTML_TAGNAME_COLOR,
        textTransform: styles.HTML_TAGNAME_TEXT_TRANSFORM,
      } as React.CSSProperties,
    },
    htmlComment: {
      color: styles.HTML_COMMENT_COLOR,
    } as React.CSSProperties,
    htmlDoctype: {
      color: styles.HTML_DOCTYPE_COLOR,
    } as React.CSSProperties,
  },
  ObjectName: {
    base: css`
      color: ${styles.OBJECT_NAME_COLOR};
    `,
    dimmed: css`
      color: ${styles.OBJECT_NAME_COLOR};
      opacity: 0.6;
    `,
  },
  ObjectValue: {
    objectValueNull: css`
      color: ${styles.OBJECT_VALUE_NULL_COLOR};
    `,
    objectValueUndefined: css`
      color: ${styles.OBJECT_VALUE_UNDEFINED_COLOR};
    `,
    objectValueRegExp: css`
      color: ${styles.OBJECT_VALUE_REGEXP_COLOR};
    `,
    objectValueString: css`
      color: ${styles.OBJECT_VALUE_STRING_COLOR};
    `,
    objectValueSymbol: css`
      color: ${styles.OBJECT_VALUE_SYMBOL_COLOR};
    `,
    objectValueNumber: css`
      color: ${styles.OBJECT_VALUE_NUMBER_COLOR};
    `,
    objectValueBoolean: css`
      color: ${styles.OBJECT_VALUE_BOOLEAN_COLOR};
    `,
    objectValueFunctionKeyword: css`
      color: ${styles.OBJECT_VALUE_FUNCTION_KEYWORD_COLOR};
      font-style: italic;
    `,
    objectValueFunctionName: css`
      font-style: italic;
    `,
  },

  TreeNode: {
    treeNodeBase: {
      color: styles.BASE_COLOR,
      backgroundColor: styles.BASE_BACKGROUND_COLOR,

      lineHeight: styles.TREENODE_LINE_HEIGHT,
      cursor: 'default',

      boxSizing: 'border-box',
      listStyle: 'none',

      fontFamily: styles.TREENODE_FONT_FAMILY,
      fontSize: styles.TREENODE_FONT_SIZE,
    } as React.CSSProperties,
    treeNodePreviewContainer: {} as React.CSSProperties,
    treeNodePlaceholder: {
      whiteSpace: 'pre',

      fontSize: styles.ARROW_FONT_SIZE,
      marginRight: styles.ARROW_MARGIN_RIGHT,
      ...unselectable,
    } as React.CSSProperties,
    treeNodeArrow: {
      base: {
        color: styles.ARROW_COLOR,
        display: 'inline-block',
        // lineHeight: '14px',
        fontSize: styles.ARROW_FONT_SIZE,
        marginRight: styles.ARROW_MARGIN_RIGHT,
        ...unselectable,
      } as React.CSSProperties,
      expanded: {
        WebkitTransform: 'rotateZ(90deg)',
        MozTransform: 'rotateZ(90deg)',
        transform: 'rotateZ(90deg)',
      } as React.CSSProperties,
      collapsed: {
        WebkitTransform: 'rotateZ(0deg)',
        MozTransform: 'rotateZ(0deg)',
        transform: 'rotateZ(0deg)',
      } as React.CSSProperties,
    },
    treeNodeChildNodesContainer: {
      margin: 0, // reset user-agent style
      paddingLeft: styles.TREENODE_PADDING_LEFT,
    } as React.CSSProperties,
  },

  TableInspector: {
    base: {
      color: styles.BASE_COLOR,

      position: 'relative',
      border: `1px solid ${styles.TABLE_BORDER_COLOR}`,
      fontFamily: styles.BASE_FONT_FAMILY,
      fontSize: styles.BASE_FONT_SIZE,
      lineHeight: '120%',
      boxSizing: 'border-box',
      cursor: 'default',
    } as React.CSSProperties,
  },

  TableInspectorHeaderContainer: {
    base: {
      top: 0,
      height: '17px',
      left: 0,
      right: 0,
      overflowX: 'hidden',
    } as React.CSSProperties,
    table: {
      tableLayout: 'fixed',
      borderSpacing: 0,
      borderCollapse: 'separate',
      height: '100%',
      width: '100%',
      margin: 0,
    } as React.CSSProperties,
  },

  TableInspectorDataContainer: {
    tr: {
      display: 'table-row',
    } as React.CSSProperties,
    td: {
      boxSizing: 'border-box',
      border: 'none', // prevent overrides
      height: '16px', // /* 0.5 * table.background-size height */
      verticalAlign: 'top',
      padding: '1px 4px',
      WebkitUserSelect: 'text',

      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      lineHeight: '14px',
    } as React.CSSProperties,
    div: {
      position: 'static',
      top: '17px',
      bottom: 0,
      overflowY: 'overlay' as any,
      transform: 'translateZ(0)',

      left: 0,
      right: 0,
      overflowX: 'hidden',
    } as React.CSSProperties,
    table: {
      positon: 'static',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      borderTop: '0 none transparent',
      margin: 0, // prevent user agent stylesheet overrides

      backgroundImage: styles.TABLE_DATA_BACKGROUND_IMAGE,
      backgroundSize: styles.TABLE_DATA_BACKGROUND_SIZE,
      tableLayout: 'fixed',

      // table
      borderSpacing: 0,
      borderCollapse: 'separate',
      // height: '100%',
      width: '100%',

      fontSize: styles.BASE_FONT_SIZE,
      lineHeight: '120%',
    } as React.CSSProperties,
  },

  TableInspectorTH: {
    base: {
      position: 'relative', // anchor for sort icon container
      height: 'auto',
      textAlign: 'left',
      backgroundColor: styles.TABLE_TH_BACKGROUND_COLOR,
      borderBottom: `1px solid ${styles.TABLE_BORDER_COLOR}`,
      fontWeight: 'normal',
      verticalAlign: 'middle',
      padding: '0 4px',

      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      lineHeight: '14px',

      ':hover': {
        backgroundColor: styles.TABLE_TH_HOVER_COLOR,
      },
    } as React.CSSProperties,
    div: {
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',

      // prevent user agent stylesheet overrides
      fontSize: styles.BASE_FONT_SIZE,
      lineHeight: '120%',
    } as React.CSSProperties,
  },

  TableInspectorLeftBorder: {
    none: {
      borderLeft: 'none',
    } as React.CSSProperties,
    solid: {
      borderLeft: `1px solid ${styles.TABLE_BORDER_COLOR}`,
    } as React.CSSProperties,
  },

  TableInspectorSortIcon: {
    display: 'block',
    marginRight: 3, // 4,
    width: 8,
    height: 7,

    marginTop: -7,
    color: styles.TABLE_SORT_ICON_COLOR,
    fontSize: 12,
    // lineHeight: 14
    ...unselectable,
  } as React.CSSProperties,
}

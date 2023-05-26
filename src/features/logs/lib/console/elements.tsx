import styled from '@emotion/styled'
import {theme} from './theme'

/**
 * Return themed log-method style
 * @param style The style
 * @param type The method
 */
const Themed = (style: string, method: string) =>
  styles[`LOG_${method.toUpperCase()}_${style.toUpperCase()}`] ||
  styles[`LOG_${style.toUpperCase()}`]

const {styles} = theme

/**
 * console-feed
 */
export const Root = styled.div`
  overflow-y: auto;
  word-break: break-word;
`

/**
 * console-message
 */
export const Message = styled.div<{method: string}>`
  position: relative;
  display: flex;
  margin-top: -1px;
  margin-bottom: ${props => +/^warn|error$/.test(props.method)};
  padding-left: 10px;
  box-sizing: border-box;
  color: ${props => Themed('color', props.method)};
  background-color: ${props => Themed('background', props.method)};
  border-top: 1px solid ${props => Themed('border', props.method)};
  border-bottom: 1px solid ${props => Themed('border', props.method)};
  & * {
    vertical-align: top;
    box-sizing: border-box;
    font-family: Menlo, monospace;
    white-space: pre-wrap;
    font-size: 11px;
  }
  & a {
    color: rgb(177, 177, 177);
  }
`

/**
 * message-icon
 */
export const Icon = styled.div<{method: string}>`
  width: 10px;
  height: 18px;
  background-image: ${props => Themed('icon', props.method)};
  background-repeat: no-repeat;
  background-position: 50% 50%;
`

/**
 * console-content
 */
export const Content = styled.div`
  clear: right;
  position: relative;
  padding: 3px 22px 2px 0;
  margin-left: 15px;
  min-height: 18px;
  flex: auto;
  width: calc(100% - 15px);
`

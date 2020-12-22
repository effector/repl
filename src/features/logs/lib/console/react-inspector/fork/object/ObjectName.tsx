import React from 'react'
import {styleSet} from '../../styles'
const styles = styleSet.ObjectName
const objectNameDimmedStyles = {
  ...styles.base,
  ...styles.dimmed,
}

/**
 * A view for object property names.
 *
 * If the property name is enumerable (in Object.keys(object)),
 * the property name will be rendered normally.
 *
 * If the property name is not enumerable (`Object.prototype.propertyIsEnumerable()`),
 * the property name will be dimmed to show the difference.
 */
export const ObjectName = ({
  name,
  dimmed = false,
}: {
  name: string
  dimmed?: boolean
}) => {
  return (
    <span style={dimmed ? objectNameDimmedStyles : styles.base}>{name}</span>
  )
}

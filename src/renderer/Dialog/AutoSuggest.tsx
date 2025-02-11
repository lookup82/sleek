import React, { useEffect, useRef, useState } from 'react'
import Autosuggest from 'react-autosuggest'
import TextField from '@mui/material/TextField'
import './AutoSuggest.scss'

const regex: RegExp = /(?<=^| )[+@][^ ]*/g

interface AutoSuggestComponentProps {
  textFieldValue: string
  setTextFieldValue: React.Dispatch<React.SetStateAction<string>>
  attributes: Attributes | null
}

const AutoSuggestComponent: React.FC<AutoSuggestComponentProps> = ({
  textFieldValue,
  setTextFieldValue,
  attributes
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [prefix, setPrefix] = useState<string | null>(null)
  const [matchPosition, setMatchPosition] = useState<{ start: number; end: number } | null>({
    start: -1,
    end: -1
  })
  const textFieldRef = useRef<HTMLInputElement>(null)

  const handleSuggestionsFetchRequested = ({ value }: { value: string }): void => {
    const content = value.replaceAll(/\n/g, ' ').replaceAll(String.fromCharCode(16), ' ')

    const cursorPosition = textFieldRef.current?.selectionStart
    if (!cursorPosition) {
      setSuggestions([])
    }

    let match
    while ((match = regex.exec(content)) !== null) {
      const matchValue = match[0]
      const matchStart = match.index
      const matchEnd = matchStart + matchValue.length
      if (cursorPosition && cursorPosition >= matchStart && cursorPosition <= matchEnd) {
        const suggestions = getSuggestions(matchValue.substring(0, 1), matchValue.substring(1))
        setSuggestions(suggestions)
        setMatchPosition({ start: matchStart, end: matchEnd })
      }
    }
  }

  const handleSuggestionSelected = (
    _event: React.SyntheticEvent,
    { suggestion }: { suggestion: string }
  ): void => {
    if (!textFieldValue || !matchPosition) return
    const appendix = textFieldValue.charAt(matchPosition.end) === '\n' ? '\n' : ' '
    const updatedValue = `${textFieldValue.slice(0, matchPosition.start)}${prefix}${suggestion}${appendix}${textFieldValue.slice(matchPosition.end + 1)}`
    setSuggestions([])
    setTextFieldValue(updatedValue)
    setMatchPosition(null)
  }

  const handleShouldRenderSuggestions = (reason: string): boolean => {
    return reason !== 'input-focused'
  }

  const getSuggestions = (trigger: string, match: string): string[] => {
    if (trigger === '@') {
      setPrefix('@')
      return Object.keys(attributes?.contexts).filter((key) => key.includes(match))
    } else if (trigger === '+') {
      setPrefix('+')
      return Object.keys(attributes?.projects).filter((key) => key.includes(match))
    } else {
      return []
    }
  }

  const handleRenderSuggestion = (
    suggestion: string,
    { isHighlighted }: { isHighlighted: boolean }
  ): JSX.Element => (
    <div
      data-todotxt-attribute={prefix === '+' ? 'projects' : prefix === '@' ? 'contexts' : ''}
      className={isHighlighted ? 'filter selected' : 'filter'}
    >
      <button
        key={suggestion}
        data-testid={`dialog-autosuggest-button-${prefix === '+' ? 'project' : prefix === '@' ? 'context' : ''}`}
      >
        {suggestion}
      </button>
    </div>
  )

  const handleSuggestionsClearRequested = (): void => {
    setSuggestions([])
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, { method }): void => {
    try {
      if (method === 'type') {
        setTextFieldValue(event.target.value)
        setSuggestions([])
      }
    } catch (error: unknown) {
      console.error(error)
    }
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    try {
      if (suggestions.length > 0 && event.key === 'Tab') {
        event.preventDefault()
        if (suggestions.length === 1) {
          handleSuggestionSelected(null, { suggestion: suggestions[0] })
        }
      } else if (suggestions.length > 0 && event.key === 'ArrowDown') {
        event.stopPropagation()
        if (suggestions.length === 1) {
          handleSuggestionSelected(null, { suggestion: suggestions[0] })
        }
      } else if (suggestions.length > 0 && event.key === 'Escape') {
        event.stopPropagation()
        setSuggestions([])
      }
    } catch (error: unknown) {
      console.error(error)
    }
  }

  const inputProps = {
    placeholder: `(A) text +project @context due:2020-12-12 t:2021-01-10 rec:d pm:1`,
    value: textFieldValue ? textFieldValue.replaceAll(String.fromCharCode(16), '\n') : '',
    inputRef: textFieldRef,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    'test-id': 'dialog-autosuggest-textfield'
  }

  useEffect(() => {
    textFieldRef.current?.focus()
  }, [textFieldRef])

  return (
    <>
      <Autosuggest
        renderInputComponent={(inputProps) => (
          <TextField {...inputProps} multiline />
        )}
        renderSuggestionsContainer={({ containerProps, children }) => (
          <div
            {...containerProps}
            style={{
              width: textFieldRef.current?.clientWidth
                ? textFieldRef.current.clientWidth + textFieldRef.current.offsetLeft * 2
                : 'auto'
            }}
          >
            {children}
          </div>
        )}
        suggestions={suggestions}
        shouldRenderSuggestions={handleShouldRenderSuggestions}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
        getSuggestionValue={(suggestion: string) => suggestion}
        renderSuggestion={handleRenderSuggestion}
        onSuggestionSelected={handleSuggestionSelected}
        inputProps={inputProps}
        focusInputOnSuggestionClick={true}
      />
    </>
  )
}

export default AutoSuggestComponent

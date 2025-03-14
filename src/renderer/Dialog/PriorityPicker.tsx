import React from 'react'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { withTranslation, WithTranslation } from 'react-i18next'
import { i18n } from '../Settings/LanguageSelector'
import './PriorityPicker.scss'

const alphabetArray = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))

const priorities = [
  { value: '-', label: '-' },
  ...alphabetArray.map((letter) => ({ value: letter, label: letter }))
]

interface PriorityPickerComponentProps extends WithTranslation {
  priority: string
  handleChange: (key: string, value: string) => void
  t: typeof i18n.t
}

const PriorityPickerComponent: React.FC<PriorityPickerComponentProps> = ({
  priority,
  handleChange,
  t
}) => {
  const handleSelectChange = (event: SelectChangeEvent<string>): void => {
    handleChange('priority', event.target.value)
  }

  return (
    <FormControl id="priorityPicker">
      <InputLabel>{t('todoDialog.priorityPicker.label')}</InputLabel>
      <Select
        id="priorityPicker"
        label={t('todoDialog.priorityPicker.label')}
        value={priority}
        onChange={handleSelectChange}
        data-testid="dialog-picker-priority"
      >
        {priorities.map((priorityOption) => (
          <MenuItem key={priorityOption.value} value={priorityOption.value}>
            {priorityOption.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default withTranslation()(PriorityPickerComponent)

import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import apiService from '../app/apiService';
import Joi from 'joi';
import moment from 'moment';
import { toast } from "react-toastify";

const initial_form = { name: '', model: '', year: '', transmissionType: '', price: 0, size: '', style: '' };

export default function FormModal({ open, handleClose, mode, selectedCar, modalKey, refreshData, setPage }) {
	const [form, setForm] = useState(initial_form);
	const [errors, setErrors] = useState({});
	const schema = Joi.object({
		name: Joi.string().required(),
		model: Joi.string().required(),
		year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
		transmissionType: Joi.string().valid('MANUAL', 'AUTOMATIC', 'AUTOMATED_MANUAL', 'DIRECT_DRIVE', 'UNKNOWN').required(),
		price: Joi.number().integer().min(1000).required(),
		size: Joi.string().valid('Compact', 'Midsize', 'Large').required(),
		style: Joi.string().required(),
	}).options({ stripUnknown: true, abortEarly: false });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
	};
	const handleEdit = async (newForm) => {
		try {
			const res = await apiService.put(`/car/${selectedCar?._id}`, { ...newForm });
			refreshData();
			setPage(1)
			toast.info("Update Car success")
			console.log(res);
		} catch (err) {
			console.log(err);
		}
	};
	const handleCreate = async (newForm) => {
		try {
			const res = await apiService.post('/car', { ...newForm });
			refreshData();
			setPage(1)
			toast.success("Create Car Success")
			console.log("res", res);
		} catch (err) {
			console.log(err.message);
		}
	};
	const handleSubmit = () => {
		const validate = schema.validate(form);
		if (validate.error) {
			const newErrors = {};
			validate.error.details.forEach((item) => (newErrors[item.path[0]] = item.message));
			setErrors(newErrors);
		} else {
			if (mode === 'create') handleCreate(validate.value);
			else handleEdit(validate.value);
			//handleClose();

		}
		setForm(initial_form);
	};
	useEffect(() => {
		if (selectedCar?._id) {
			setErrors({});
			setForm(selectedCar);
		} else setForm(initial_form);
	}, [selectedCar?._id, selectedCar]);

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} key={modalKey}>
			<Dialog
				open={open}
				onClose={() => {
					handleClose();
					setErrors({});
				}}
			>
				<DialogTitle>{mode === 'create' ? 'CREATE A NEW CAR' : 'EDIT CAR'}</DialogTitle>
				<DialogContent>
					<Stack spacing={2}>
						<TextField
							error={errors.name}
							helperText={errors.name ? errors.name : null}
							value={form.name}
							autoFocus
							margin="dense"
							name="name"
							label="Name"
							type="text"
							fullWidth
							variant="standard"
							onChange={handleChange}
						/>
						<TextField
							error={errors.model}
							helperText={errors.model ? errors.model : null}
							value={form.model}
							onChange={handleChange}
							autoFocus
							margin="dense"
							name="model"
							label="Model"
							type="text"
							fullWidth
							variant="standard"
						/>
						<FormControl error={errors.transmissionType} variant="standard" sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="transmission_type_label">Transmission Type</InputLabel>
							<Select labelId="transmission_type_label" name="transmissionType" value={form.transmissionType} onChange={handleChange} label="Transmission Type">
								{['MANUAL', 'AUTOMATIC', 'AUTOMATED_MANUAL', 'DIRECT_DRIVE', 'UNKNOWN'].map((item) => (
									<MenuItem value={item} key={item}>
										{item}
									</MenuItem>
								))}
							</Select>
							{errors.transmissionType ? <FormHelperText>{errors.transmissionType}</FormHelperText> : null}
						</FormControl>
						<FormControl error={errors.size} variant="standard" sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="size-label">Size</InputLabel>
							<Select labelId="size-label" name="size" value={form.size} onChange={handleChange} label="Size">
								{['Compact', 'Midsize', 'Large'].map((item) => (
									<MenuItem value={item} key={item}>
										{item}
									</MenuItem>
								))}
							</Select>
							{errors.size ? <FormHelperText>{errors.size}</FormHelperText> : null}
						</FormControl>
						<TextField
							error={errors.style}
							helperText={errors.style ? errors.style : null}
							value={form.style}
							margin="dense"
							name="style"
							label="Style"
							type="text"
							fullWidth
							variant="standard"
							onChange={handleChange}
						/>
						<Stack direction="row" spacing={2}>
							<DatePicker
								views={['year']}
								label="Year"
								value={moment(form.year.toString()).format('YYYY')}
								error={errors.year}
								onChange={(newValue) => {
									setForm({ ...form, year: moment(newValue).year() });
								}}
								renderInput={(params) => <TextField {...params} helperText={errors.year ? errors.year : null} />}
							/>

							<TextField
								value={form.price}
								onChange={handleChange}
								error={errors.price}
								helperText={errors.price ? errors.price : null}
								margin="dense"
								name="price"
								label="Price"
								type="number"
								variant="standard"
							/>
						</Stack>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancel</Button>
					<Button onClick={handleSubmit}>{mode === 'create' ? 'Create' : 'Save'}</Button>
				</DialogActions>
			</Dialog>
		</LocalizationProvider>
	);
}

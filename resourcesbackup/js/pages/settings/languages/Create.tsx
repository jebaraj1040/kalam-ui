import { useForm } from '@inertiajs/react';

export default function Form({ language = null }: any) {
    const { data, setData, post, put, errors } = useForm({
        code: language?.code || '',
        name: language?.name || '',
        native_name: language?.native_name || '',
    });

    const submit = () => {
        if (language) {
            put(`/languages/${language._id}`);
        } else {
            post('/languages');
        }
    };

    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">{language ? 'Edit' : 'Add'} Language</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                }}
            >
                <input type="text" placeholder="Code" value={data.code} onChange={(e) => setData('code', e.target.value)} className="input" />
                {errors.code && <p>{errors.code}</p>}

                <input type="text" placeholder="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="input" />
                {errors.name && <p>{errors.name}</p>}

                <input
                    type="text"
                    placeholder="Native Name"
                    value={data.native_name}
                    onChange={(e) => setData('native_name', e.target.value)}
                    className="input"
                />
                {errors.native_name && <p>{errors.native_name}</p>}

                <button type="submit" className="btn btn-success mt-4">
                    {language ? 'Update' : 'Create'}
                </button>
            </form>
        </div>
    );
}

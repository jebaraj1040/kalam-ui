import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import SelcetInput from "@/Components/SelcetInput";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head } from "@inertiajs/react";
import SecondaryButton from "@/Components/SecondaryButton";

export default function Edit() {
  const { status, site } = usePage().props;

  const { data, setData, patch, errors, processing } = useForm({
    id: site.id,
    name: site.name,
    status: site.status,
    unique_id: site.unique_id,
  });

  const submit = (e) => {
    e.preventDefault();
    patch(route("cms.dynamo.sites.update", site.id));
  };

  return (
    <AuthenticatedLayout>
      <Head title="Site-Edit" />

      <div className="md:py-12">
        <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
          <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
            <section className="max-w-full">
              <header>
                <h2 className="section-title">Edit Site - {data.name}</h2>
              </header>

              <form onSubmit={submit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                  <div>
                    <InputLabel htmlFor="name" value="Site Name" />
                    <TextInput
                      id="name"
                      className="mt-1 block w-full "
                      name="name"
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.name} />
                  </div>

                  <div>
                    <InputLabel htmlFor="status" value="Status" />
                    <SelcetInput
                      className="mt-1 block w-full "
                      options={status}
                      name="status"
                      selectedValue={data.status}
                      onChange={(e) => setData("status", e.target.value)}
                    />
                    <InputError className="mt-2" message={errors.status} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center !mt-10 gap-4">
                  <Link
                    href={route("cms.dynamo.sites.index")}
                    className="w-full md:w-auto"
                  >
                    <SecondaryButton>Cancel</SecondaryButton>
                  </Link>
                  <PrimaryButton disabled={processing}>Update</PrimaryButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

import React, { useEffect } from 'react';
import { Card } from 'antd';
import { useLocation } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import useAxios, {configure} from 'axios-hooks';
import axiosInstance from 'services/AxiosInstance';

import EnrollmentStore from 'store/Enrollment';
import { EnrollmentTable } from 'components/enrollment';

configure({
  axios: axiosInstance,
});

export default function EnrolledOfferContainer({
  scopedToProvider = false,
  provider_id,
  activateCreditAssignment
}) {
  const history = useHistory();
  const location = useLocation();
  const enrollmentStore = EnrollmentStore.useContainer();
  
  const query = new URLSearchParams(location.search);
  const selectedOffer = Number(query.get('selectedOffer'));

  const getEnrollmentsUrl = () => {
    const url = '/enrollments?scope=with_offers';
    if (scopedToProvider && selectedOffer) {
      return `${url}&offer_id=${selectedOffer}&provider_id=${provider_id}`;
    }

    if (scopedToProvider) {
      return `${url}&provider_id=${provider_id}`;
    }

    return url;
  }

  const [{
    data: enrollmentBody,
    error: enrollmentError,
  }] = useAxios(getEnrollmentsUrl());
  
  if (enrollmentError) {
    history.push('/error/500');
  }

  useEffect(() => {
    if (enrollmentBody) {
      enrollmentStore.addMany(enrollmentBody);
    }
  }, [enrollmentBody]);

  let dataSource = Object.values(enrollmentStore.entities);

  if (scopedToProvider) {
    dataSource = dataSource.filter(enrollment => enrollment.provider_id === provider_id);
  }

  if (selectedOffer) {
    dataSource = dataSource.filter(enrollment => {
      return enrollment.offer_id === selectedOffer;
    });
  }

  return (
    <Card className="shadow-md rounded-md">
      <EnrollmentTable
        dataSource={dataSource}
        selectedOffer={selectedOffer}
        activateCreditAssignment={activateCreditAssignment}
      />
    </Card>
  );
}

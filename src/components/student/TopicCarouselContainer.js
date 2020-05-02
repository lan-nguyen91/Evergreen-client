import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAxios, { configure } from 'axios-hooks';
import { Card, Button } from 'antd';
import { compact, groupBy, property } from 'lodash';
import useGlobalStore from 'store/GlobalStore';
import axiosInstance from 'services/AxiosInstance';
import { Carousel } from 'react-responsive-carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { InfoCard } from 'components/student';
import { TitleDivider } from 'components/shared';
import 'scss/responsive-carousel-override.scss';

configure({
  axios: axiosInstance,
});

export default function() {
  const [currentTopic, setCurrentTopic] = useState(null);
  const [onCurrentChange, setOnCurrentChange] = useState(null);
  const { datafield, offer: offerStore, provider } = useGlobalStore();
  const [{ data: dataFieldPayload }] = useAxios(
    '/datafields?scope=with_offers'
  );
  const [{ data: offerPayload }] = useAxios('/offers?scope=with_details');
  const [{ data: providerPayload }] = useAxios('/providers');

  useEffect(() => {
    if (dataFieldPayload) {
      datafield.addMany(dataFieldPayload);
    }
    if (offerPayload) {
      offerStore.addMany(offerPayload);
    }
    if (providerPayload) {
      provider.addMany(providerPayload);
    }
  }, [dataFieldPayload, offerPayload, providerPayload]);

  const topics = compact(
    Object.values(datafield.entities).filter(d => d.type === 'topic')
  );

  topics.push({ name: 'Others' });

  const groupedDataFields = groupBy(datafield.entities, property('type'));

  const handleChange = e => {};

  const handleCurrentItem = (current, total) => {
    const index = current - 1;
    setTimeout(() => {
      if (onCurrentChange !== current) {
        setOnCurrentChange(current);
      }
      if (onCurrentChange !== current) {
        setCurrentTopic(topics[index]);
      }
    }, 50);
    return null;
  };

  const renderArrowBtns = (
    onClickHandler,
    hasPrevOrNext,
    label,
    icon,
    style = { right: 15 }
  ) => {
    if (!icon) {
      return null;
    }
    return (
      hasPrevOrNext && (
        <Button
          type="link"
          onClick={onClickHandler}
          className="custom-control-arrow flex justify-center"
          style={style}
        >
          <FontAwesomeIcon icon={icon} />
        </Button>
      )
    );
  };

  const renderOffers = () => {
    let currentOffers = [];
    let offerId = null;
    let renderOFfers = compact(currentTopic.Offers);

    for (let i = 0; i < renderOFfers.length; i++) {
      offerId = renderOFfers[i].id;
      currentOffers.push(offerStore.entities[offerId]);
    }

    if (currentTopic.name === 'Others') {
      currentOffers = Object.values(offerStore.entities);
    }

    return currentOffers.map((offer, index) => {
      let p = null;
      if (offer && offer.provider_id) {
        p = provider.entities[offer.provider_id];
      }

      return (
        <InfoCard
          key={index}
          className="mx-auto mb-4"
          style={{ width: 425, borderRadius: '1rem' }}
          data={offer}
          provider={p}
          groupedDataFields={groupedDataFields}
          actions={[
            <Link to={`/home/offer/${offer.id}`}>
              <p>View</p>
            </Link>,
          ]}
        />
      );
    });
  };

  return (
    <div className="h-auto">
      <TitleDivider
        title={'OFFERS BY TOPICS'}
        align="center"
        classNames={{ middleSpan: 'text-base' }}
      />
      <Carousel
        className="custom-carousel mb-2 cursor-grab"
        centerMode
        infiniteLoop
        centerSlidePercentage={50}
        showArrows={true}
        showIndicators={false}
        swipeable={true}
        emulateTouch={true}
        onChange={handleChange}
        showStatus={true}
        statusFormatter={handleCurrentItem}
        showThumbs={false}
        renderArrowNext={(...rest) => {
          return renderArrowBtns(...rest, faArrowRight);
        }}
        renderArrowPrev={(...rest) => {
          return renderArrowBtns(...rest, faArrowLeft, { left: 15 });
        }}
        swipeScrollTolerance={1}
      >
        {topics.map((topic, index) => {
          return (
            <Card
              className="mx-auto text-white text-lg w-auto flex justify-center items-center"
              style={{
                width: 375,
                backgroundColor: 'rgb(7, 25, 80)',
                height: 50,
              }}
              key={index}
            >
              {topic.name}
            </Card>
          );
        })}
      </Carousel>
      <main className="p-2">{currentTopic && renderOffers()}</main>
    </div>
  );
}
